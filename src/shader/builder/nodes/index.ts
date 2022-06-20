import { NodeKey } from '../../../interface/program/nodes';
import { Field } from '../../../interface/types/nodes';
import { pushIfNotIncluded } from '../../../utils/general';
import { hsvToRgbChunk } from '../../chunk/color/hsvToRgb';
import { simplex3dChunk } from '../../chunk/noise/simplex3d';
import { GlslFunction, Imports, Parameter } from '../../types/core';
import { hsvToRgbConfig } from './color/color';
import { checkersConfig } from './generator/checkers';
import { circleConfig } from './generator/circle';
import { rectConfig } from './generator/rect';
import { simplexConfig } from './generator/simplex';
import { staticConfig } from './generator/static';
import { waveConfig } from './generator/wave';
import { clampConfig, combineConfig, remapConfig } from './math/math';
import { rootConfig } from './root';
import { displaceConfig, polarDisplaceConfig } from './warp/displace';
import { scaleConfig } from './warp/scale';
import { vortexConfig } from './warp/vortex';

export const nodeConfigs = {
  // Root
  [rootConfig.name]: rootConfig,

  // Generator
  [simplexConfig.name]: simplexConfig,
  [waveConfig.name]: waveConfig,
  [circleConfig.name]: circleConfig,
  [checkersConfig.name]: checkersConfig,
  [staticConfig.name]: staticConfig,
  [rectConfig.name]: rectConfig,

  // Math
  [combineConfig.name]: combineConfig,
  [clampConfig.name]: clampConfig,
  [remapConfig.name]: remapConfig,

  // Color
  [hsvToRgbConfig.name]: hsvToRgbConfig,

  // Modifier
  [displaceConfig.name]: displaceConfig,
  [polarDisplaceConfig.name]: polarDisplaceConfig,
  [scaleConfig.name]: scaleConfig,
  [vortexConfig.name]: vortexConfig
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

// TODO add imports on nodeConfig instead!
export const addNodeImports = (imports: Imports, type: NodeKey) => {
  switch(type) {
    case 'simplex': pushIfNotIncluded(imports, simplex3dChunk); break;
    case 'hsvToRgb': pushIfNotIncluded(imports, hsvToRgbChunk); break;
  }
};