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
    'tFeedback': {
      kind: 'static',
      type: 'sampler2D',
      value: undefined as undefined | THREE.Texture,
      hidden: true
    }
  },
  glsl: dedent`
    return texture2D(tFeedback, point).rgb;
  `
} as const;