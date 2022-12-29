import * as THREE from 'three';
import dedent from 'ts-dedent';
import { sizeScaleChunk } from '../../../chunk/util/sizeScale';

export const rectConfig = {
  name: 'rect',
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
    'width': {
      kind: 'dynamic',
      type: 'float',
      value: 300.0,
      min: 0.0,
      max: 500.0
    },
    'height': {
      kind: 'dynamic',
      type: 'float',
      value: 300.0,
      min: 0.0,
      max: 500.0
    },
    'radius': {
      kind: 'dynamic',
      type: 'float',
      value: 0.3,
      min: 0.0,
      max: 1.0
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
    float cx = scale * (scaleByViewportSize(x) + viewport.x / 2.0);
    float cy = scale * (scaleByViewportSize(y) + viewport.y / 2.0);

    float w = scaleByViewportSize(width * scale);
    float h = scaleByViewportSize(height * scale);

    vec2 pos = vec2(cx, cy);
    vec2 size = vec2(w, h);

    float d = length(max(abs(point.xy - pos) - size, 0.0)) - radius;
    d = smoothstep(0.0, 1.0, pow(clamp(d, 0.0, 1.0), max(softness, 0.0001)));

    return mix(insideBrightness, outsideBrightness, d);
  `
} as const;