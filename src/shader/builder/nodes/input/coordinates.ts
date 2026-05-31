import * as THREE from 'three';
import dedent from 'ts-dedent';

export const xConfig = {
  name: 'x',
  returnType: 'float',
  group: 'input',
  fields: {
    point: {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true,
    },
    from: {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
    to: {
      kind: 'dynamic',
      type: 'float',
      value: 1,
    },
  },
  glsl: dedent`
    return (gl_FragCoord.x / viewport.x) * (to - from) + from;
  `,
} as const;

export const yConfig = {
  name: 'y',
  returnType: 'float',
  group: 'input',
  fields: {
    point: {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true,
    },
    from: {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
    to: {
      kind: 'dynamic',
      type: 'float',
      value: 1,
    },
  },
  glsl: dedent`
    return (gl_FragCoord.y / viewport.y) * (to - from) + from;
  `,
} as const;
