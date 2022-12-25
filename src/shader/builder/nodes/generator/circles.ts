import * as THREE from 'three';
import dedent from 'ts-dedent';
import { sizeScaleChunk } from '../../../chunk/util/sizeScale';

export const circlesConfig = {
  name: 'circles',
  returnType: 'float',
  group: 'generator',
  imports: [sizeScaleChunk],
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
    'padding': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1.0
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
    float r = scaleByViewportSize(radius * scale);

    float cx = scale * (viewport.x / 2.0);
    float cy = scale * (viewport.y / 2.0);

    float dx = mod(point.x - cx, (r + padding) * 2.0) - r - padding;
    float dy = mod(point.y - cy, (r + padding) * 2.0) - r - padding;

    float distSq = dx * dx + dy * dy;

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