import * as THREE from 'three';
import dedent from 'ts-dedent';

import { simplex3dChunk } from '../../../chunk/noise/simplex3d';

// TODO: store as constants somewhere?
const noiseFunctionName = 'simplex3d';
const maxNumberOfOctaves = 5;

export const simplexConfig = {
  name: 'simplex',
  returnType: 'float',
  group: 'generator',
  imports: [simplex3dChunk],
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      // internal: true
      internalOptional: true
    },
    'frequency': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 10.0
    },
    'amplitude': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 10.0
    },
    'persistance': {
      kind: 'dynamic',
      type: 'float',
      value: 0.5,
      min: 0.0,
      max: 1.0
    },
    'lacunarity': {
      kind: 'dynamic',
      type: 'float',
      value: 2.0,
      min: 0.0,
      max: 10.0
    },
    'octaves': {
      kind: 'static',
      type: 'int',
      value: 3.0,
      min: 1,
      max: 5,
      restricted: true
    },
    'exponent': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.01,
      max: 10.0
    },
    'ridge': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.001,
      max: 1.0,
      restricted: true
    },
    'normalize': {
      kind: 'static',
      type: 'bool',
      value: true,
    },
  },
  glsl: dedent`
    float n = 0.0;
    float f = frequency;
    float a = amplitude;
    float divider = 0.0;

    for(int i = 0; i < min(${ Math.floor(maxNumberOfOctaves) }, octaves); i++) {
      vec3 p = point * f;
      float on = pow(${ noiseFunctionName }(p), exponent);

      if(on > ridge) on = ridge - (on - ridge);
      on /= ridge;

      n += a * on;

      divider += a;

      a *= persistance;
      f *= lacunarity;
    }

    if(normalize && divider != 0.0) { 
      n /= divider; 
    }

    return amplitude * n;
  `
} as const;