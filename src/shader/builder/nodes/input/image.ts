import * as THREE from 'three';
import dedent from 'ts-dedent';

export const imageConfig = {
  name: 'image',
  returnType: 'vec3',
  group: 'input',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'source': {
      kind: 'static',
      type: 'sampler2D',
      value: undefined as undefined | THREE.Texture
    },
    'scaleX': {
      kind: 'dynamic',
      type: 'float',
      min: -1.0,
      value: 1.0,
      max: 1.0,
    },
    'scaleY': {
      kind: 'dynamic',
      type: 'float',
      min: -1.0,
      value: 1.0,
      max: 1.0,
    },
    'translateX': {
      kind: 'dynamic',
      type: 'float',
      min: -2.0,
      value: 0.0,
      max: 2.0,
    },
    'translateY': {
      kind: 'dynamic',
      type: 'float',
      min: -2.0,
      value: 0.0,
      max: 2.0,
    }
  },
  glsl: dedent`
    vec2 samplePoint = (point.xy + vec2(translateX, translateY)) * vec2(scaleX, scaleY);
    return texture2D(source, samplePoint).rgb;
  `
} as const;