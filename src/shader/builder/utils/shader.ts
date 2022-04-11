import dedent from 'ts-dedent';
import { NodeKey, ShaderNode } from '../../../interface/program/nodes';
import { capitalizeFirstLetter } from '../../../utils/general';
import { Attributes, Constants, GlslFunction, GlslFunctions, GlslVariable, Imports, Uniforms } from '../../types/core';
import { arrayToString, variableValueToGLSL } from './glsl';

export const importsToGLSL = (imports: Imports) => {
  if(!imports) return '';
  return arrayToString(imports, chunk => `${ chunk.glsl }\n`);
};

export const constantsToGLSL = (constants: Constants | undefined) => {
  if(!constants) return '';
  return arrayToString( 
    Object.entries(constants), 
    ([name, { type, value }]) => `const ${ type } ${ name } = ${ variableValueToGLSL({ type, value } as GlslVariable) };` 
  );
};

export const uniformsToGLSL = (uniforms: Uniforms) => {
  if(!uniforms) return '';
  return arrayToString( 
    Object.entries(uniforms), 
    ([name, { type }]) => `uniform ${ type } ${ name };`   
  );
};

export const attributesToGLSL = (attributes: Attributes) => {
  if(!attributes) return '';
  return arrayToString( 
    Object.entries(attributes), 
    ([name, { type }]) => `varying ${ type } ${ name };`   
  );
};

export const functionToGLSL = (name: string, glslFunction: GlslFunction) => {
  return dedent`
    ${ glslFunction.returnType } ${ name }( 
      ${ arrayToString(glslFunction.parameters, arg => `${ arg[0] } ${ arg[1] }`, ', ') }
    ) {
      ${ glslFunction.body }
    }\n`;
};

export const functionsToGLSL = (functions: GlslFunctions | undefined) => {
  if(!functions) return '';
  return arrayToString( 
    Object.entries(functions), 
    ([name, glslFunction]) => functionToGLSL(name, glslFunction), '\n\n' 
  );
};

export const getNodeFunctionName = (nodeOrType: ShaderNode | NodeKey) => {
  const type = typeof nodeOrType === 'object'
    ? nodeOrType.type
    : nodeOrType;

  return `get${ capitalizeFirstLetter(type) }`;
};

export const getUniformName = (node: ShaderNode, fieldName: string) => {
  return `u${ capitalizeFirstLetter(fieldName) }_${ node.id }`;
};

export const getReturnVariableName = (node: ShaderNode) => {
  return `r${ capitalizeFirstLetter(node.type) }_${ node.id }`;
};