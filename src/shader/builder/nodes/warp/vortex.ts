import * as THREE from 'three';
import dedent from 'ts-dedent';

export const vortexConfig = {
  name: 'vortex',
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
    'amount': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -Math.PI,
      max: Math.PI
    },
    'multiplier': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -2,
      max: 2
    },
    'radius': {
      kind: 'dynamic',
      type: 'float',
      value: 1000.0,
      min: 0,
      max: 2000,
    },
    'falloff': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.001,
      max: 10,
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
    float r = scale * radius;

    vec3 v = point - vec3(cx, cy, point.z);
    float dist = min(sqrt(dot(v, v)), r);

    float f = pow(max(1.0 - dist / r, 0.0), falloff);

    float strength = (dist * multiplier + amount) * f;

    point -= vec3(cx, cy, 0.0);
    point = vec3(
      point.x * cos(strength) - point.y * sin(strength),
      point.y * cos(strength) + point.x * sin(strength),
      point.z
    );
    point += vec3(cx, cy, 0.0);

    return point;
  `
} as const;