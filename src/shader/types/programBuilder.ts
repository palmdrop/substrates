import { FieldsInit } from '../../interface/types/nodes';
import { GLSL, GlslType, Imports } from './core';

export type NodeConfig<N extends string = string, F extends FieldsInit = FieldsInit> = {
  name: N,
  fields: F,
  glsl: GLSL,
  returnType: GlslType,
  group: string,
  imports?: Imports
};
