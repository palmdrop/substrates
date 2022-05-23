import * as THREE from 'three';
import dedent from 'ts-dedent';

export const displaceConfig = {
  name: 'displace',
  returnType: 'vec3',
  group: 'modifier',
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
      value: 0.0,
      min: -1000,
      max: 1000,
    },
    'y': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000,
      max: 1000,
    },
    'z': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000,
      max: 1000,
    },
    'amount': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
    },
  },
  glsl: dedent`
    return point + vec3(x, y, z) * amount;
  `
} as const;