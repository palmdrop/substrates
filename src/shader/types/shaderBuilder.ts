import { Constants, GLSL, GlslFunctions, Imports } from './core';

export type ShaderSourceData = {
  imports: Imports, // TODO: do I need imports? what even is an import?
  constants?: Constants, // TODO: do I need constants? just write constants inline?
  functions?: GlslFunctions,
  main: GLSL,
}