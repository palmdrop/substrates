export const colorKeys = [
  'bg', 
  'fg',
  'nodeBg',
  'nodeBgHighlight',
  'nodeBorder',
  'nodeAnchorHighlight',
  'nodeAnchorBorder',
  'nodeActiveBorder',
  'nodeConnectionFloat',
  'nodeConnectionVec3'
] as const;

export const fontKeys = [
  'displayFont',
  'regularFont'
] as const;

export const paddingKeys = [
  'padding-0',
  'padding-1',
  'padding-2',
  'padding-3',
  'padding-4'
] as const;

export type Colors = { 
  [key in typeof colorKeys[number]]: string 
};

export type Fonts = { 
  [key in typeof fontKeys[number]]: string 
};

export type Paddings = { 
  [key in typeof paddingKeys[number]]: string 
};
