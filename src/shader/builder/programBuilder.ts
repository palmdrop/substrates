import * as THREE from 'three';
import dedent from 'ts-dedent';

import { NodeKey, ShaderNode } from '../../interface/program/nodes';
import { isShaderNode } from '../../interface/program/utils';
import { Field } from '../../interface/types/nodes';
import { Program } from '../../interface/types/program/program';
import { Attributes, GLSL, GlslFunctions, Imports, Uniforms } from '../types/core';
import { ShaderSourceData } from '../types/shaderBuilder';
import { addNodeImports, createNodeFunction } from './nodes';
import { buildShader } from './shaderBuilder';
import { iterateDepthFirst, validateProgram } from './utils/general';
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
// NOTE TODO: but order of args has to match order of node fields AND order of node function arguments... find better way to map this
const processFields = (
  node: ShaderNode,
  uniforms: Uniforms
): GLSL[] => { 
  const args: GLSL[] = []; // Default argument
  (Object.entries(node.fields) as [string, Field][]).forEach(entry => {
    const [name, field] = entry;
    const value = field.value;

    // If the field is declared "internal", then the node will receive the argument
    // from within the shader builder, not from a uniform or node connection
    if(field.internal && !field.excludeFromFunction) {
      args.push(name);
    }
    // If the current field value is a node, 
    // use the result of that node calculation as an argument
    else if(isShaderNode(value) && !field.excludeFromFunction) {
      args.push(getReturnVariableName(value));
    }
    // If the current field is not a node, 
    // create a uniform and use that as the return value
    else {
      const uniformName = getUniformName(node, name);
      uniforms[uniformName] = {
        type: field.type,
        value: field.value
      };

      if(!field.excludeFromFunction) {
        args.push(uniformName);
      }
    }
  });

  return args;
};

const buildFragmentShader = (
  program: Program,
  imports: Imports,
  functions: GlslFunctions,
  uniforms: Uniforms
): ShaderSourceData => {
  // TODO: associate each node with a key of some sort, maybe just an index?
  // TODO: when rendering, read program and extract uniform values... OR just set uniform values when change is triggered
  /*
    1. iterate over nodeTypes, add functions for each type (sensible names, such as "getNoise", "getSin", "get...")
    2. iterate over all nodes, depth first
      a. create a uniform for each non-dynamic value (and store default)
      b. call related function with appropriate arguments
      c. store result in variable. Keep track of variable name in map. When another node needs it, retrieve
    3. convert root node result to color (using color settings if existing)
    4. build shader using shader builder
  */

  // TODO scale hard coded for now... :(
  const scaleUniform = getUniformName(program.rootNode, 'scale');
  const speedUniformX = getUniformName(program.rootNode, 'speedX');
  const speedUniformY = getUniformName(program.rootNode, 'speedY');
  const speedUniformZ = getUniformName(program.rootNode, 'speedZ');
  let fragMain: GLSL = dedent`
    vec3 point = vec3(gl_FragCoord.xy * ${ scaleUniform }, 0.0);
    point += vec3(${ speedUniformX }, ${ speedUniformY }, ${ speedUniformZ }) * time;
  `;

  const visited = new Set<ShaderNode>();
  iterateDepthFirst(
    program.rootNode,
    (node: ShaderNode) => {
      if(visited.has(node)) return;
      visited.add(node);

      const args = processFields(node, uniforms);
      const funcName = getNodeFunctionName(node);
      const returnVariableName = getReturnVariableName(node); 

      fragMain += dedent`\n
        ${ functions[funcName].returnType } ${ returnVariableName } = ${ funcName }(${ args.join(', ') });
      `;
    }
  );

  // TODO normalize functions!
  
  fragMain += dedent`\n
    gl_FragColor = vec4(${ getReturnVariableName(program.rootNode) }, 1.0);
  `;

  console.log(fragMain);

  return {
    imports,
    functions,
    main: fragMain
  };
};

export const buildProgramShader = (program: Program) => {
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
    addNodeImports(imports, type);
  });

  const vertexShader = buildVertexShader();
  const fragmentShader = buildFragmentShader(program, imports, functions, uniforms);

  const shader = buildShader(
    attributes,
    uniforms,
    vertexShader,
    fragmentShader
  );

  return shader;
};