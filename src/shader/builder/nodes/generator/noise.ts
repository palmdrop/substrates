import * as THREE from 'three';
import dedent from 'ts-dedent';

import { fastVoronoi3dChunk } from '../../../chunk/noise/fastVoronoi3d';
import { simplex3dChunk } from '../../../chunk/noise/simplex3d';

const maxNumberOfOctaves = 5;

const createNoiseFields = () => {
  return {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
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
    }
  };
};

const createNoiseBody = (noiseFunctionName: string, maxNumberOfOctaves: number) => {
  return dedent`
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
  `;
};

export const simplexConfig = {
  name: 'simplex',
  returnType: 'float',
  group: 'generator',
  imports: [simplex3dChunk],
  fields: createNoiseFields(),
  glsl: createNoiseBody(Object.keys(simplex3dChunk.functionSignatures!)[0], maxNumberOfOctaves),
} as const;

export const voronoiConfig = {
  name: 'voronoi',
  returnType: 'float',
  group: 'generator',
  imports: [fastVoronoi3dChunk],
  fields: createNoiseFields(),
  glsl: createNoiseBody(Object.keys(fastVoronoi3dChunk.functionSignatures!)[0], maxNumberOfOctaves),
} as const;