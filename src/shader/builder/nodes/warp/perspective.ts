import * as THREE from 'three';
import dedent from 'ts-dedent';

export const perspectiveConfig = {
  name: 'perspective',
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
    'pointOffset': {
      kind: 'static',
      type: 'vec3',
      value: new THREE.Vector3(),
      internal: true
    },
    'horizonDistortion': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0
    },
    'depthDistortion': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0
    }
  },
  glsl: dedent`
    float width = viewport.x;
    float height = viewport.y;

    float cX = 0.5 * width * scale;

    float xMultiplier = mix(1.0, point.y - pointOffset.y, horizonDistortion);
    float zOffset = mix(1.0, point.y - pointOffset.y, depthDistortion);

    return (point - vec3(cX + pointOffset.x, 0.0, 0.0)) * vec3(xMultiplier, 1.0, 1.0) + vec3(cX + pointOffset.x, 0.0, zOffset);
  `
} as const;