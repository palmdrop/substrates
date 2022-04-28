import * as THREE from 'three';
import dedent from 'ts-dedent';

export const warpConfig = {
  name: 'warp',
  returnType: 'float',
  group: 'modifier',
  fields: {
    'point': {
      kind: 'static',
      type: 'vec3',
      value: new THREE.Vector3(),
      internal: true
    },
    'source': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      consumed: true
    },
    'warpX': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      consumed: true
    },
    'warpY': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      consumed: true
    },
    'warpZ': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      consumed: true
    },
    'amount': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
    'iterations': {
      kind: 'static',
      type: 'int',
      value: 1,
      min: 1,
      max: 5
    }
  },
  glsl: dedent`
    return 1.0;
  `
} as const;