import dedent from 'ts-dedent';

import { ShaderChunk } from '../../types/core';

// based on https://gist.github.com/983/e170a24ae8eba2cd174f

export const hsvToRgbChunk: ShaderChunk = {
  glsl: dedent`
    vec3 hsvToRgb(vec3 hsv) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
      return hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);
    }
  `,
  functionSignatures: {
    'hsvToRgb': {
      parameters: [['vec3', 'color']],
      returnType: 'vec3',
    }
  }
};

export const rgbToHsvChunk: ShaderChunk = {
  glsl: dedent`
    vec3 rgbToHsv(vec3 rgb) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(rgb.bg, K.wz), vec4(rgb.gb, K.xy), step(rgb.b, rgb.g));
      vec4 q = mix(vec4(p.xyw, rgb.r), vec4(rgb.r, p.yzx), step(p.x, rgb.r));
  
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
  `,
  functionSignatures: {
    'rgbToHsv': {
      parameters: [['vec3', 'color']],
      returnType: 'vec3',
    }
  }
};