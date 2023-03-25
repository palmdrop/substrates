import * as THREE from 'three';
import dedent from 'ts-dedent';

export const colorChooser = {
  name: 'colorChooser',
  returnType: 'vec3',
  group: 'color',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'sources': {
      kind: 'dynamic',
      // type: `sampler2D[${MAX_ARRAY_SIZE}]`,
      type: 'vec3[]',
      // value: [new THREE.Vector3()] as THREE.Vector3[],
      value: [] as THREE.Vector3[],
      defaultValue: [new THREE.Vector3()]
      // updateUniform: false
    },
    'pick': {
      kind: 'dynamic',
      type: 'float',
      value: 0
    }
  },
  glsl: dedent`
    /*
    vec2 samplePoint = (point.xy + vec2(translateX, translateY)) * vec2(scaleX, scaleY);
    return texture2D(source, samplePoint).rgb;
    */
    return vec3(1.0, 0.0, 0.0);
  `
} as const;