import * as THREE from 'three';
import dedent from 'ts-dedent';

export const feedbackConfig = {
  name: 'feedback',
  returnType: 'vec3',
  group: 'input',
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
    'tFeedback': {
      kind: 'static',
      type: 'sampler2D',
      value: undefined as undefined | THREE.Texture,
      hidden: true
    }
  },
  glsl: dedent`
    return texture2D(tFeedback, point.xy / (viewport * scale)).rgb;
  `
} as const;