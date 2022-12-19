import dedent from "ts-dedent";
import { ShaderChunk } from "../../types/core";

export const sizeScaleChunk: ShaderChunk = {
  glsl: dedent`
    const float defaultViewportWidth = 1920.0;
    const float defaultViewportHeight = 1080.0;

    float getSizeScale() {
      return min(
        viewport.x / defaultViewportWidth,
        viewport.y / defaultViewportHeight
      );
    }

    float scaleByViewportSize(float value) {
      return getSizeScale() * value;
    }
  `,
  functionSignatures: {
    'getSizeScale': {
      parameters: [],
      returnType: 'float'
    },
    'scaleByViewportSize': {
      parameters: [['float', 'value']],
      returnType: 'float'
    }
  }
};