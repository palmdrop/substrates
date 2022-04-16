import { NodeKey } from '../../../interface/program/nodes';
import { Field } from '../../../interface/types/nodes';
import { pushIfNotIncluded } from '../../../utils/general';
import { simplex3dChunk } from '../../chunk/noise/simplex3d';
import { GlslFunction, Imports, Parameter } from '../../types/core';
import { clampConfig, combineConfig, remapConfig } from './math';
import { rootConfig } from './root';
import { simplexConfig } from './simplex';
import { waveConfig } from './wave';

export const nodeConfigs = {
  [rootConfig.name]: rootConfig,
  [simplexConfig.name]: simplexConfig,
  [waveConfig.name]: waveConfig,
  [combineConfig.name]: combineConfig,
  [clampConfig.name]: clampConfig,
  [remapConfig.name]: remapConfig,
} as const;

export const createNodeFunction = (type: NodeKey): GlslFunction => {
  const config = nodeConfigs[type];
  const parameters = (Object.entries(config.fields) as [string, Field][])
    .filter(entry => !entry[1].excludeFromFunction)
    .map(([name, field]) => (
      [field.type, name] as Parameter
    ));
  
  return {
    parameters,
    returnType: config.returnType,
    body: config.glsl
  };
};

export const addNodeImports = (imports: Imports, type: NodeKey) => {
  switch(type) {
    case 'simplex': pushIfNotIncluded(imports, simplex3dChunk);
  }
};