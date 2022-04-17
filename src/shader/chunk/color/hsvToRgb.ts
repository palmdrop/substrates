import dedent from 'ts-dedent';

import { ShaderChunk } from '../../types/core';

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