import dedent from 'ts-dedent';

export const combineConfig = {
  name: 'combine',
  returnType: 'float',
  group: 'math',
  fields: {
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
      }
    },
    'value1': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'value2': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    }
  },
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
    }
  `
} as const;

export const clampConfig = {
  name: 'clamp',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'min': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -1.0,
      max: 1.0,
    },
    'max': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -1.0,
      max: 1.0,
    }
  },
  glsl: dedent`
    return clamp(value, min, max);
  `
} as const;

export const remapConfig = {
  name: 'remap',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'add': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: -10.0,
      max: 10.0,
    },
    'mult': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: -10.0,
      max: 10.0,
    }
  },
  glsl: dedent`
    return mult * value + add;
  `
} as const;

export const mixConfig = {
  name: 'mix',
  returnType: 'float',
  group: 'math',
  fields: {
    'value1': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'value2': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
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

export const quantizeConfig = {
  name: 'quantize',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'steps': {
      kind: 'dynamic',
      type: 'int',
      value: 2,
      min: 1,
      max: 10
    },
  },
  glsl: dedent`
    return round(value * float(steps)) / float(steps);
  `
} as const;

export const floatToInt = {
  name: 'floatToInt',
  returnType: 'int',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
  },
  glsl: dedent`
    return int(value);
  `
} as const;

export const heightmap = {
  name: 'heightmap',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'frequency': {
      kind: 'dynamic',
      type: 'float',
      value: 2.0,
      min: 0.0001,
      max: 10
    },
    'thickness': {
      kind: 'dynamic',
      type: 'float',
      value: 0.01,
      min: 0.0001,
      max: 1
    },
    /*
    'softness': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1
    },
    */
    'lineValue': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 1
    },
    'bodyValue': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0,
      min: 0.0,
      max: 1
    }
  },
  glsl: dedent`
    // TODO: add threshold! let this control thickness, and nothing below!
    float d = 1.0 / frequency;
    float t = d * thickness;
    float offset = abs(d - mod(value, d));
    if(offset <= t) {
      return lineValue;
    }

    return bodyValue;
  `
} as const;