import * as THREE from 'three';
import dedent from 'ts-dedent';

export const staticConfig = {
  name: 'static',
  returnType: 'float',
  group: 'generator',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'min': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1.0
    },
    'max': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 1.0
    },
  },
  glsl: dedent`
    float s = fract(sin(dot(point.xy, vec2(12.9898 + point.z, 78.233))) * 43758.5453);
    return s * (max - min) + min;
  `
} as const;