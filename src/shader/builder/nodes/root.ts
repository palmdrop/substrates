import * as THREE from 'three';
import dedent from 'ts-dedent';

export const rootConfig = {
  name: 'root',
  returnType: 'vec3',
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
      value: 0.0
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
    }
  },
  glsl: dedent`
    return vec3(source, source, source);
  `
} as const;