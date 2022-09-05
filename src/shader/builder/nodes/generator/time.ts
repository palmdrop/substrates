import dedent from 'ts-dedent';

export const timeConfig = {
  name: 'time',
  returnType: 'float',
  group: 'generator',
  fields: {
    'speed': {
      kind: 'dynamic',
      type: 'float',
      value: 1.0
    },
    'time': {
      kind: 'static',
      type: 'float',
      value: 1.0,
      internal: true
    },
  },
  glsl: dedent`
    return time * speed;
  `
} as const;