import * as THREE from 'three';
import dedent from 'ts-dedent';

export const checkersConfig = {
  name: 'checkers',
  returnType: 'float',
  group: 'generator',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    /*
    'scale': {
      kind: 'static',
      type: 'float',
      internal: true
    },
    */
    'cellsX': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 10.0
    },
    'cellsY': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 10.0
    },
    'cellsZ': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 10.0
    },
    'value1': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1.0
    },
    'value2': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 1.0
    }
  },
  glsl: dedent`
    float total = (
      floor(point.x * cellsX) + 
      floor(point.y * cellsY) + 
      floor(point.z * cellsZ)
    );

    bool even = mod(total, 2.0) == 0.0;
    return even ? value1 : value2;
  `
} as const;