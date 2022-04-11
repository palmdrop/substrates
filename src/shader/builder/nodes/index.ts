import dedent from 'ts-dedent';
import { NodeKey } from '../../../interface/program/nodes';
import { pushIfNotIncluded } from '../../../utils/general';
import { simplex3dChunk } from '../../chunk/noise/simplex3d';
import { GlslFunction, Imports } from '../../types/core';
import { createNoiseFunction } from './noiseFunction';

const createRootFunction = (): GlslFunction => {
  return {
    parameters: [['float', 'value']],
    returnType: 'vec3',
    body: dedent`
      return vec3(value, value, value);
    `
  };
};

// TODO: create unified interface for defining node type and related function!!! 
// TODO: strict typing, single source! 
export const createNodeFunction = (type: NodeKey): GlslFunction => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const simplexFunctionName = Object.keys(simplex3dChunk.functionSignatures!)[0];
  switch(type) {
    case 'root': return createRootFunction();
    case 'simplex': return createNoiseFunction(simplexFunctionName, 5);
    case 'sin': return createRootFunction(); // TODO
  }
};

export const addNodeImports = (imports: Imports, type: NodeKey) => {
  switch(type) {
    case 'simplex': pushIfNotIncluded(imports!, simplex3dChunk);
  }
};