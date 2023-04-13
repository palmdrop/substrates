import * as THREE from 'three';
import dedent from 'ts-dedent';

import { NodeKey, ShaderNode } from '../../interface/program/nodes';
import { isShaderNode } from '../../interface/program/utils';
import { Field } from '../../interface/types/nodes';
import { Program } from '../../interface/types/program/program';
import { pushIfNotIncluded } from '../../utils/general';
import { Attributes, GLSL, GlslFunctions, GlslRootType, GlslType, Imports, Uniforms } from '../types/core';
import { NodeConfig } from '../types/programBuilder';
import { ShaderSourceData } from '../types/shaderBuilder';
import { createNodeFunction, nodeConfigs } from './nodes';
import { buildShader } from './shaderBuilder';
import { getFieldValue, isArrayType, iterateDepthFirst, removeArrayType, validateProgram } from './utils/general';
import { getNodeFunctionName, getReturnVariableName, getUniformName } from './utils/shader';

const getDefaultImports = (): Imports => {
  return [];
};

const getDefaultAttributes = (): Attributes => {
  return {
    'vUv': {
      type: 'vec2'
    }
  };
};

const getDefaultUniforms = (): Uniforms => {
  return {
    'viewport': {
      value: new THREE.Vector2(1, 1),
      type: 'vec2'
    },
    'time': {
      value: 0.0,
      type: 'float'
    },
  };
};

const buildVertexShader = (): ShaderSourceData => {
  const vertexMain: GLSL = dedent`
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  `;

  return {
    imports: [],
    main: vertexMain
  };
};

// Returns a list of arguments to input into node function
// Also, adds uniforms for dynamic values
// NOTE: Since ES2015, I can trust that object keys are iterated in insertion order!
const processFields = (
  node: ShaderNode,
  uniforms: Uniforms
): { args: GLSL[], addedUniforms: string[] } => { 
  const args: GLSL[] = []; // Default argument
  const addedUniforms: string[] = [];

  (Object.entries(node.fields) as [string, Field][]).forEach(entry => {
    const [name, field] = entry;
    const value = field.value;

    // If the field is declared "internal", then the node will receive the argument
    // from within the shader builder, not from a uniform or node connection
    if(field.internal && !field.excludeFromFunction) {
      args.push(name);
    }
    // If optionally internal and not set to another shader node
    else if(field.internalOptional && !isShaderNode(value)) {
      args.push(name);
    }
    // If the current field value is a node, 
    // use the result of that node calculation as an argument
    else if(isShaderNode(value) && !field.excludeFromFunction) {
      // TODO: here I need to consider multiple shader nodes assigned to the same node! and construct a temporary variable to pass ?
      args.push(getReturnVariableName(value));
    }
    // If the current field is not a node, 
    // create a uniform and use that as the return value
    else if(!field.external) {
      const uniformName = getUniformName(node, name);
      if(isArrayType(field)) {
        uniforms[uniformName] = {
          type: `${removeArrayType(field.type)}[1]`,
          value: getFieldValue(field)
        };
      } else {
        uniforms[uniformName] = {
          type: field.type as GlslRootType,
          value: field.value
        };
      }

      addedUniforms.push(uniformName);

      if(!field.excludeFromFunction) {
        args.push(uniformName);
      }
    }
  });

  return { args, addedUniforms };
};

export type OutputFormat = 'float' | 'vec4';

export type AdditionalData = {
  feedbackTextureUniforms?: string[]
}

const buildProgramCore = (
  program: Program,
  imports: Imports,
  functions: GlslFunctions,
  uniforms: Uniforms,
  outputFormat: OutputFormat = 'vec4'
): { shaderData: ShaderSourceData, additionalData: AdditionalData } => {
  const scaleUniform = getUniformName(program.rootNode, 'scale');
  const speedUniformX = getUniformName(program.rootNode, 'speedX');
  const speedUniformY = getUniformName(program.rootNode, 'speedY');
  const speedUniformZ = getUniformName(program.rootNode, 'speedZ');

  let main: GLSL = dedent`
    float scale = ${ scaleUniform };
    vec3 pointOffset = vec3(${ speedUniformX }, ${ speedUniformY }, ${ speedUniformZ }) * time;
    point += pointOffset;
  `;

  const visited = new Set<ShaderNode>();
  const feedbackTextureUniforms: string[] = [];
  iterateDepthFirst(
    program.rootNode,
    (node: ShaderNode) => {
      if(visited.has(node)) return;
      visited.add(node);

      const { args, addedUniforms } = processFields(node, uniforms);
      if(node.type === 'feedback') {
        addedUniforms.forEach(uniformName => {
          if(!uniformName.startsWith('uTFeedback')) return;
          feedbackTextureUniforms.push(uniformName);
        });
      }

      const funcName = getNodeFunctionName(node);
      const returnVariableName = getReturnVariableName(node); 

      main += dedent`\n
        ${ functions[funcName].returnType } ${ returnVariableName } = ${ funcName }(${ args.join(', ') });
      `;
    }
  );

  console.log(uniforms);

  const rootReturnVariableName = getReturnVariableName(program.rootNode);
  if(outputFormat === 'vec4') {
    main += dedent`\n
      vec4 result = vec4(${ rootReturnVariableName }, 1.0);
    `;
  } else {
    main += dedent`\n
      float result = ${ rootReturnVariableName }.x;
    `;
  }

  const shaderData = {
    imports,
    functions,
    main,
  };

  const additionalData = {
    feedbackTextureUniforms
  };

  return {
    shaderData,
    additionalData
  };
};

const buildFragmentShader = (
  program: Program,
  imports: Imports,
  functions: GlslFunctions,
  uniforms: Uniforms
): { shaderData: ShaderSourceData, additionalData: AdditionalData } => {
  const { shaderData, additionalData } = buildProgramCore(
    program,
    imports,
    functions,
    uniforms
  );

  const scaleUniform = getUniformName(program.rootNode, 'scale');
  shaderData.main = dedent`
    vec3 point = vec3(gl_FragCoord.xy * ${ scaleUniform }, 0.0);
    ${ shaderData.main }
    gl_FragColor = result;
  `;

  return { shaderData, additionalData };
};

const prepareBuild = (program: Program) => {
  if(validateProgram(program)) throw new Error('Invalid program');

  const imports: Imports = getDefaultImports();
  const uniforms: Uniforms = getDefaultUniforms();
  const attributes: Attributes = getDefaultAttributes();
  const functions: GlslFunctions = {};

  const nodeTypes = new Set<NodeKey>();
  iterateDepthFirst(
    program.rootNode, 
    node => {
      nodeTypes.add(node.type);
    }
  );

  nodeTypes.forEach(type => {
    const name = getNodeFunctionName(type);
    functions[name] = createNodeFunction(type);

    const config = nodeConfigs[type] as NodeConfig;

    if(config.imports && config.imports.length) {
      config.imports?.forEach(configImport => pushIfNotIncluded(imports, configImport));
    }
  })

  return {
    imports,
    uniforms,
    attributes,
    functions
  };
};

export const buildProgramShader = (program: Program) => {
  const {
    imports,
    attributes,
    functions,
    uniforms,
  } = prepareBuild(program);

  const vertexShader = buildVertexShader();
  const { shaderData: fragmentShader, additionalData } = buildFragmentShader(program, imports, functions, uniforms);

  const shader = buildShader(
    attributes,
    uniforms,
    vertexShader,
    fragmentShader
  );

  return { shader, additionalData };
};

export const buildProgramFunction = (
  program: Program,
  functionNameSuffix = '',
  outputFormat: OutputFormat = 'float'
) => {
  const {
    imports,
    attributes,
    functions,
    uniforms,
  } = prepareBuild(program);

  const { shaderData } = buildProgramCore(program, imports, functions, uniforms, outputFormat);
  const functionName = 'programFunction' + functionNameSuffix;

  functions[
    functionName
  ] = {
    parameters: [
      ['vec3', 'point']
    ],
    returnType: outputFormat,
    body: dedent`
      ${ shaderData.main }
      return result;
    `
  };

  return {
    imports,
    attributes,
    functions,
    uniforms,
    functionName: 'programFunction' + functionNameSuffix,
  };
};
