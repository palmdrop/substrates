import * as THREE from 'three';
import dedent from 'ts-dedent';

export const pixelateConfig = {
  name: 'pixelate',
  returnType: 'vec3',
  group: 'warp',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'scale': {
      kind: 'static',
      type: 'float',
      value: 1.0,
      internal: true
    },
    'stepsX': {
      kind: 'dynamic',
      type: 'int',
      value: 10.0,
      min: 1.0,
      max: 20.0
    },
    'stepsY': {
      kind: 'dynamic',
      type: 'int',
      value: 10.0,
      min: 1.0,
      max: 20.0
    },
    'stepsZ': {
      kind: 'dynamic',
      type: 'int',
      value: 1000.0,
      min: 1.0,
      max: 1000.0
    },
  },
  glsl: dedent`
    float x = floor(point.x * float(stepsX)) / float(stepsX);
    float y = floor(point.y * float(stepsY)) / float(stepsY);
    float z = floor(point.z * float(stepsZ)) / float(stepsZ);

    return vec3(x, y, z);
  `
} as const;