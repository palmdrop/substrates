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

export const contrastConfig = {
  name: 'contrast',
  returnType: 'vec3',
  group: 'color',
  imports: [],
  fields: {
    'source': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    },
    'contrast': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 2.0
    },
    'brightness': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
  },
  glsl: dedent`
    return (source - 0.5) * contrast + 0.5 + brightness;
  `
} as const;

export const lerpConfig = {
  name: 'lerp',
  returnType: 'vec3',
  group: 'color',
  fields: {
    'value1': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    },
    'value2': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    },
    'amount': {
      kind: 'dynamic',
      type: 'float',
      value: 0.5,
      min: 0.0,
      max: 1.0,
    }
  },
  glsl: dedent`
    return mix(value1, value2, amount);
  `
} as const;

export const colorCombineConfig = {
  name: 'colorCombine',
  returnType: 'vec3',
  group: 'color',
  imports: [hsvToRgbChunk],
  fields: {
    'value1': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    },
    'value2': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3()
    },
    'operation': {
      kind: 'choice',
      type: 'int',
      value: 0,
      choices: {
        add: 0,
        mult: 1,
        pow: 2,
        avg: 3,
        mod: 4,
        brightest: 5,
        darkest: 6
      }
    }
  },
  // TODO: implement dynamic glsl output that changes based on choice
  // TODO: Recompile shader when specific choice fields changes
  glsl: dedent`
    if(operation == 0) {
      return value1 + value2;
    } else if(operation == 1) {
      return value1 * value2;
    } else if(operation == 2) {
      return pow(value1, value2);
    } else if(operation == 3) {
      return (value1 + value2) / 2.0;
    } else if(operation == 4) {
      return mod(value1, value2);
    } else if(operation == 5) {
      return hsvToRgb(value1).z > hsvToRgb(value2).z ? value1 : value2;
    } else {
      return hsvToRgb(value1).z < hsvToRgb(value2).z ? value1 : value2;
    }
  `
} as const;