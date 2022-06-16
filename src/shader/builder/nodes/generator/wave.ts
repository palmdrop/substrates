import * as THREE from 'three';

export const waveConfig = {
  name: 'wave',
  returnType: 'float',
  group: 'generator',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'frequency': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 100.0
    },
    'xAmount': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -1.0,
      max: 1.0
    },
    'yAmount': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0
    },
    'zAmount': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0
    },
    'min': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1
    },
    'max': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -1.0,
      max: 1
    },
    'power': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.01,
      max: 10
    },
  },
  glsl: `
    if(xAmount == 0.0 && yAmount == 0.0) return 0.0;

    float x = point.x * xAmount; 
    float y = point.y * yAmount;
    float s = frequency * (x + y) / (abs(xAmount) + abs(yAmount));

    float v = sin(s);
    v = (v + 1.0) / 2.0;
    v = pow(v, power);

    return (max - min) * v + min;
  `
} as const;