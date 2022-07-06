import * as THREE from 'three';
import dedent from 'ts-dedent';

import { hsvToRgbChunk, rgbToHsvChunk } from '../../../chunk/color/hsvToRgb';

export const hsvToRgbConfig = {
  name: 'hsvToRgb',
  returnType: 'vec3',
  group: 'color',
  imports: [hsvToRgbChunk],
  fields: {
    'hue': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'saturation': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    }
  },
  glsl: dedent`
    // TODO: optimize slightly by splitting hsvToRgb args to x y z instead of vec3
    return hsvToRgb(vec3(hue, saturation, value));
  `
} as const;

export const hueConfig = {
  name: 'hue',
  returnType: 'float',
  group: 'color',
  imports: [rgbToHsvChunk],
  fields: {
    'source': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    }
  },
  glsl: dedent`
    return rgbToHsv(source).x;
  `
} as const;

export const saturationConfig = {
  name: 'saturation',
  returnType: 'float',
  group: 'color',
  imports: [rgbToHsvChunk],
  fields: {
    'source': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    }
  },
  glsl: dedent`
    return rgbToHsv(source).y;
  `
} as const;

export const brightnessConfig = {
  name: 'brightness',
  returnType: 'float',
  group: 'color',
  imports: [rgbToHsvChunk],
  fields: {
    'source': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    }
  },
  glsl: dedent`
    return rgbToHsv(source).z;
  `
} as const;