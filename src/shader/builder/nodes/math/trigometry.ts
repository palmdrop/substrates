import dedent from 'ts-dedent';

export const sinConfig = {
  name: 'sin',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'multiplier': {
      kind: 'dynamic',
      type: 'float',
      value: 1,
      min: -10,
      max: 10
    },
  },
  glsl: dedent`
    return sin(value) * multiplier;
  `
} as const;

export const cosConfig = {
  name: 'cos',
  returnType: 'float',
  group: 'math',
  fields: {
    'value': {
      kind: 'dynamic',
      type: 'float',
      value: 0.0
    },
    'multiplier': {
      kind: 'dynamic',
      type: 'float',
      value: 1,
      min: -10,
      max: 10
    },
  },
  glsl: dedent`
    return cos(value) * multiplier;
  `
} as const;