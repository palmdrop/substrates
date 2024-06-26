import { NodeKey } from '../../../interface/program/nodes';
import { FieldsInit } from '../../../interface/types/nodes';
import { GlslFunction, Parameter } from '../../types/core';
import { brightnessConfig, colorCombineConfig, contrastConfig, hsvToRgbConfig, hueConfig, lerpConfig, saturationConfig } from './color/color';
import { checkersConfig } from './generator/checkers';
import { circleConfig } from './generator/circle';
import { circlesConfig } from './generator/circles';
import { simplexConfig, voronoiConfig } from './generator/noise';
import { rectConfig } from './generator/rect';
import { staticConfig } from './generator/static';
import { timeConfig } from './generator/time';
import { waveConfig } from './generator/wave';
import { feedbackConfig } from './input/feedback';
import { imageConfig } from './input/image';
import { clampConfig, combineConfig, floatToInt, heightmap, mixConfig, quantizeConfig, remapConfig } from './math/math';
import { cosConfig, sinConfig } from './math/trigometry';
import { rootConfig } from './root';
import { displaceConfig, polarDisplaceConfig } from './warp/displace';
import { mirrorConfig } from './warp/mirror';
import { perspectiveConfig } from './warp/perspective';
import { pixelateConfig } from './warp/pixelate';
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
  [timeConfig.name]: timeConfig,

  // Input
  [imageConfig.name]: imageConfig,
  [feedbackConfig.name]: feedbackConfig,

  // Math
  [combineConfig.name]: combineConfig,
  [clampConfig.name]: clampConfig,
  [remapConfig.name]: remapConfig,
  [mixConfig.name]: mixConfig,
  [quantizeConfig.name]: quantizeConfig,
  [sinConfig.name]: sinConfig,
  [cosConfig.name]: cosConfig,
  [floatToInt.name]: floatToInt,
  [heightmap.name]: heightmap,

  // Color
  [hsvToRgbConfig.name]: hsvToRgbConfig,
  [hueConfig.name]: hueConfig,
  [saturationConfig.name]: saturationConfig,
  [brightnessConfig.name]: brightnessConfig,
  [contrastConfig.name]: contrastConfig,
  [lerpConfig.name]: lerpConfig,
  [colorCombineConfig.name]: colorCombineConfig,

  // Warp
  [displaceConfig.name]: displaceConfig,
  [polarDisplaceConfig.name]: polarDisplaceConfig,
  [scaleConfig.name]: scaleConfig,
  [vortexConfig.name]: vortexConfig,
  [perspectiveConfig.name]: perspectiveConfig,
  [pixelateConfig.name]: pixelateConfig,
  [mirrorConfig.name]: mirrorConfig
} as const;

export const createNodeFunction = (type: NodeKey): GlslFunction => {
  const config = nodeConfigs[type];
  const parameters = (Object.entries(config.fields) as [string, FieldsInit[string]][])
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