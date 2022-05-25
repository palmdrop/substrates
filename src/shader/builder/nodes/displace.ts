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
      min: -5,
      max: 5,
    },
    'y': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -5,
      max: 5,
    },
    'z': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -5,
      max: 5,
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

export const polarDisplaceConfig = {
  name: 'polarDisplace',
  returnType: 'vec3',
  group: 'modifier',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'angle1': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -Math.PI,
      max: Math.PI,
    },
    'angle2': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -Math.PI,
      max: Math.PI,
    },
    'radius': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -5,
      max: 5,
    },
  },
  glsl: dedent`
    // return point + vec3(x, y, z) * amount;
    float dx = radius * cos(angle1) * sin(angle2);
    float dy = radius * sin(angle1) * cos(angle2);
    float dz = radius * cos(angle2);
    return point + vec3(dx, dy, dz);
  `
} as const;