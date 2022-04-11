import dedent from 'ts-dedent';
import { Attributes, Shader, Uniforms } from '../types/core';
import { ShaderSourceData } from '../types/shaderBuilder';
import { attributesToGLSL, constantsToGLSL, functionsToGLSL, importsToGLSL, uniformsToGLSL } from './utils/shader';

/*
- [ ] remove function system from old shader builder
  - [ ] ONLY use function for recurring tasks, i.e ONE function for each node type, but then call this function with diff args in main
  - [ ] no CACHING need! just name result var in good way (RES_NODEX_1), then reuse the value of that everywhere. Make sure not mutated

*/

export const buildShader = ( 
  attributes: Attributes,
  uniforms: Uniforms,

  vertexSourceData: ShaderSourceData,
  fragmentSourceData: ShaderSourceData
): Shader => {

  const attributesGLSL = attributesToGLSL(attributes);
  const uniformsGLSL = uniformsToGLSL(uniforms);

  const vertexShader = dedent`
    ${ attributesGLSL }
    ${ uniformsGLSL }

    ${ importsToGLSL(vertexSourceData.imports) }
    ${ constantsToGLSL(fragmentSourceData.constants) }
    ${ functionsToGLSL(vertexSourceData.functions) }

    void main() {
      ${ vertexSourceData.main }
    }
  `;

  const fragmentShader = dedent`
    ${ attributesGLSL }
    ${ uniformsGLSL }

    ${ importsToGLSL(fragmentSourceData.imports) }
    ${ constantsToGLSL(fragmentSourceData.constants) }
    ${ functionsToGLSL(fragmentSourceData.functions) }

    void main() {
      ${ fragmentSourceData.main }
    }
  `;

  return {
    uniforms,
    vertexShader,
    fragmentShader
  };
};

