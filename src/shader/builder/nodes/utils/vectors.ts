import * as THREE from 'three';
import dedent from 'ts-dedent';

export const toVec3Config = {
  name: 'vec3',
  returnType: 'vec3',
  group: 'utils',
  fields: {
    x: {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
    y: {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
    z: {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
    },
  },
  glsl: dedent`
    return vec3(x, y, z);
  `,
} as const;

export const getComponentConfig = {
  name: 'getComponent',
  returnType: 'float',
  group: 'utils',
  fields: {
    value: {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
    },
    operation: {
      kind: 'choice',
      type: 'int',
      value: 0,
      choices: {
        x: 0,
        y: 1,
        z: 2,
      },
    },
  },
  glsl: dedent`
    if(operation == 0) return value.x;
    if(operation == 1) return value.y;
    if(operation == 2) return value.z;
  `,
} as const;
