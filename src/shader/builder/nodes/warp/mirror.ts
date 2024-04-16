import * as THREE from 'three';
import dedent from 'ts-dedent';

export const mirrorConfig = {
  name: 'mirror',
  returnType: 'vec3',
  group: 'warp',
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
    'mirrorX': {
      kind: 'static',
      type: 'bool',
      value: true,
    },
    'mirrorY': {
      kind: 'static',
      type: 'bool',
      value: false,
    },
    'mirrorZ': {
      kind: 'static',
      type: 'bool',
      value: false,
    },
    'centerX': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000,
      max: 1000,
    },
    'centerY': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000,
      max: 1000,
    },
  },
  glsl: dedent`
    float cx = scale * (centerX + viewport.x / 2.0);
    float cy = scale * (centerY + viewport.y / 2.0);

    float x = point.x - cx;
    float y = point.y - cy;
    float z = point.z;

    if(mirrorX) {
        x = abs(x);
    }

    if(mirrorY) {
        y = abs(y);
    }

    if(mirrorZ) {
        z = abs(z);
    }

    return vec3(x + cx, y + cy, z);
  `
} as const;