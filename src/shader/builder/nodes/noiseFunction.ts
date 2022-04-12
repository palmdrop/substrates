import dedent from 'ts-dedent';

import { GlslFunction } from '../../types/core';

// TODO rename function and file to "simplex" something?

// TODO: # of octaves hard coded for now
// TODO: fix this guy... amplitude is not what it should be?
export const createNoiseFunction = (noiseFunctionName: string, maxOctaves: number): GlslFunction => {
  return {
    parameters: [
      // Sample point
      ['vec3', 'point'],

      // Noise settings
      ['float', 'frequency'],
      ['float', 'amplitude'],
      ['float', 'persistance'],
      ['float', 'lacunarity'],
      ['int', 'octaves'],
      ['float', 'exponent'],
      ['float', 'ridge'],
      ['bool', 'normalize']
    ],
    returnType: 'float',
    body: dedent`
      float n = 0.0;
      float f = frequency;
      float a = amplitude;
      float divider = 0.0;

      for(int i = 0; i < min(${ Math.floor(maxOctaves) }, octaves); i++) {
        vec3 p = point * f;
        float on = pow(${ noiseFunctionName }(p), exponent);

        if(on > ridge) on = ridge - (on - ridge);
        on /= ridge;

        n += a * on;

        divider += a;

        a *= persistance;
        f *= lacunarity;
      }

      if(normalize && divider != 0.0) { 
        n /= divider; 
      }

      return amplitude * n;
    `
  };
};