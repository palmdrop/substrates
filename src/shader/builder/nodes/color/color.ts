import dedent from 'ts-dedent';

export const hsvToRgbConfig = {
  name: 'hsvToRgb',
  returnType: 'vec3',
  group: 'color',
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