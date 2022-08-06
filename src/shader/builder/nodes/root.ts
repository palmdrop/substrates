import * as THREE from 'three';
import dedent from 'ts-dedent';

import ditheringTexturePath from '../../../assets/blue-noise/LDR_RGBA_7.png';
import { createDitheringTexture } from '../utils/texture';

const ditheringTexture = createDitheringTexture(ditheringTexturePath);
const ditheringTextureDimensions = new THREE.Vector2(
  128, 128
);

export const rootConfig = {
  name: 'root',
  displayName: 'output',
  returnType: 'vec3',
  group: 'system',
  fields: {
    'point': {
      kind: 'static',
      type: 'vec3',
      value: new THREE.Vector3(),
      internal: true
    },
    'color': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      inputLocked: true
    },
    'dithering': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'scale': {
      kind: 'static',
      type: 'float',
      value: 0.005,
      min: 0.00001,
      max: 0.1,
      excludeFromFunction: true
    },
    'speedX': {
      kind: 'static',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0,
      excludeFromFunction: true
    },
    'speedY': {
      kind: 'static',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0,
      excludeFromFunction: true
    },
    'speedZ': {
      kind: 'static',
      type: 'float',
      value: 0.1,
      min: -1.0,
      max: 1.0,
      excludeFromFunction: true
    },
    'ditheringTextureDimensions': {
      kind: 'static',
      type: 'vec2',
      value: ditheringTextureDimensions,
      hidden: true
    },
    'tDithering': {
      kind: 'static',
      type: 'sampler2D',
      value: ditheringTexture,
      hidden: true
    }
  },
  glsl: dedent`
    vec2 ditheringCoord = gl_FragCoord.xy / ditheringTextureDimensions + vec2(fract(time * 13.41), fract(time * 3.451));
    vec3 ditheringValue = dithering * texture(tDithering, ditheringCoord).rgb - dithering / 2.0;
    return color + ditheringValue;
  `
} as const;