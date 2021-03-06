import * as THREE from 'three';
import dedent from 'ts-dedent';

export const circleConfig = {
  name: 'circle',
  returnType: 'float',
  group: 'generator',
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
    'radius': {
      kind: 'dynamic',
      type: 'float',
      value: 300.0,
      min: 0.0,
      max: 1000.0
    },
    'x': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000.0,
      max: 1000.0
    },
    'y': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1000.0,
      max: 1000.0
    },
    'outsideBrightness': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1.0
    },
    'insideBrightness': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 1.0
    },
    'softness': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1.0
    },
  },
  glsl: dedent`
    float cx = scale * (x + viewport.x / 2.0);
    float cy = scale * (y + viewport.y / 2.0);

    float dx = (point.x - cx);
    float dy = (point.y - cy);
    float distSq = dx * dx + dy * dy;

    float r = radius * scale;

    if(distSq < (r * r)) {
      float dist = sqrt(distSq);
      float n = 1.0 - dist / r;

      if(n > softness) return insideBrightness;

      float d = smoothstep(softness, 0.0, n);
      return mix(insideBrightness, outsideBrightness, d);
    } else {
      return outsideBrightness;
    }
  `
} as const;