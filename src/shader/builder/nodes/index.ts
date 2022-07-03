import { NodeKey } from '../../../interface/program/nodes';
import { Field } from '../../../interface/types/nodes';
import { GlslFunction, Parameter } from '../../types/core';
import { hsvToRgbConfig } from './color/color';
import { checkersConfig } from './generator/checkers';
import { circleConfig } from './generator/circle';
import { circlesConfig } from './generator/circles';
import { simplexConfig, voronoiConfig } from './generator/noise';
import { rectConfig } from './generator/rect';
import { staticConfig } from './generator/static';
import { waveConfig } from './generator/wave';
import { clampConfig, combineConfig, mixConfig, remapConfig } from './math/math';
import { rootConfig } from './root';
import { displaceConfig, polarDisplaceConfig } from './warp/displace';
import { scaleConfig } from './warp/scale';
import { vortexConfig } from './warp/vortex';

export const nodeConfigs = {
  // Root
  [rootConfig.name]: rootConfig,

  // Generator
  [simplexConfig.name]: simplexConfig,
  [voronoiConfig.name]: voronoiConfig,
  [waveConfig.name]: waveConfig,
  [circleConfig.name]: circleConfig,
  [circlesConfig.name]: circlesConfig,
  [checkersConfig.name]: checkersConfig,
  [staticConfig.name]: staticConfig,
  [rectConfig.name]: rectConfig,

  // Math
  [combineConfig.name]: combineConfig,
  [clampConfig.name]: clampConfig,
  [remapConfig.name]: remapConfig,
  [mixConfig.name]: mixConfig,

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