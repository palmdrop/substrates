import * as THREE from 'three';
import dedent from 'ts-dedent';

export const scaleConfig = {
  name: 'scale',
  returnType: 'vec3',
  group: 'warp',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'x': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -5,
      max: 5,
    },
    'y': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -5,
      max: 5,
    },
    'z': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -5,
      max: 5,
    },
  },
  glsl: dedent`
    return point * vec3(x, y, z);
  `
} as const;