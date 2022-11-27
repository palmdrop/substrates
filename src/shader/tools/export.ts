import * as THREE from 'three';

import { Program } from '../../interface/types/program/program';
import { programHistoryStore$ } from '../../stores/programStore';
import { variableValueToGLSL } from '../builder/utils/glsl';
import { getUniformName } from '../builder/utils/shader';
import { Uniform } from '../types/core';

const glslUniformRegex = /uniform [\w]+ (\w+);/;

const nonEmbeddableUniforms = [
  'viewport', 'time'
];

const imageNodes = [
  'image'
];

const imageUniforms = [
  'source'
];

const readmeText = `
  # Substrate export
  A substrate export consists of a few things:
  * vertex shader code
  * fragment shader code
  * this README
  * a set of uniforms
  * associated data, such as images
  
  The fragment shader and vertex shader are regular GLSL. Create a THREE.js shader material and use as you would with any shader material. However, keep in mind that you need to set the uniforms appropriately.

  The uniforms object contains all the values set as the program was exported. These should be set when the material is created. Something like \`material.uniforms = JSON.parse(exportData).uniforms\` should work.

  Keep in mind that this does not work for images or feedback nodes. Image data can be included in the data object, base64 encoded. You have to manually create textures and set these to the correct uniforms. Feedback nodes are a bit more difficult. For this to work, set up multiple framebuffers and alternate renders between them. Assign the passive framebuffer texture to the feedback uniforms. 

  The viewport uniform should be set to the current size of the canvas. The time uniform needs to be continuously updated for the shader to animate.
`;

type ExportSettings = {
  embedUniforms?: boolean,
  includeImages?: boolean,
  includeReadme?: boolean
}

type Data = {
  encodedImages?: { 
    [uniformName: string]: { 
      data: string 
    } 
  }
} & Record<string, any>;

export type Export = {
  vertexShader: string,
  fragmentShader: string,
  uniforms?: { [uniformName: string]: { value: any, type: string }},
  readme?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Data
}

const embedUniformsIfPossible = (exportData: Export) => {
  const uniforms = exportData.uniforms;
  if(!uniforms) return { ...exportData };

  const remainingUniforms: Export['uniforms'] = {};

  const embed = (shaderString: string) => {
    const shaderLines = shaderString.split('\n');
    shaderLines.forEach((line, index) => {
      const match = line.match(glslUniformRegex);
      if(!match) return;

      const uniformName = match[1];
      const uniform = uniforms[uniformName];
      if(!uniform) return;

      // TODO: Are there other types that cannot be embedded?
      if(
        uniform.type.startsWith('sampler') || 
        nonEmbeddableUniforms.includes(uniformName)
      ) {
        remainingUniforms[uniformName] = uniform;
        return;
      }

      shaderLines[index] = `const ${ uniform.type } ${ uniformName } = ${ variableValueToGLSL(uniform as Uniform) };`;
    });

    return shaderLines.join('\n');
  };

  return {
    vertexShader: embed(exportData.vertexShader),
    fragmentShader: embed(exportData.fragmentShader),
    uniforms: remainingUniforms
  };
};

const extractImageData = (program: Program) => {
  const imageData: {
    [uniformName: string]: {
      data: string
    }
  } = {};

  program.nodes.forEach(node => {
    if(!imageNodes.includes(node.type)) return;

    Object.keys(node.fields).forEach(fieldName => {
      if(!imageUniforms.includes(fieldName)) return;

      const uniformName = getUniformName(node, fieldName);
      const field = node.fields[fieldName] as { value: THREE.Texture };

      imageData[uniformName] = {
        data: (field.value.userData as { data: string }).data
      };
    });
  });

  return imageData;
};

export const exportProgram = (
  {
    embedUniforms = false,
    includeImages = true,
    includeReadme = true
  }: ExportSettings
) => new Promise<Export>((resolve, reject) => {
  programHistoryStore$.subscribe(
    ({ program, history }) => {
      const current = history.at(-1);
      if(!current || !program) {
        reject('Export failed. No program in store.');
        return;
      }

      const {
        shaderMaterial: material,
      } = current;

      if(!material) {
        reject('Export failed. No shader material.');
        return;
      }

      const { vertexShader, fragmentShader, uniforms } = material;

      if(!vertexShader || !fragmentShader) {
        reject('Export failed. Fragment shader or vertex shader missing.');
        return;
      }

      let exportData: Export = {
        vertexShader,
        fragmentShader,
        uniforms: uniforms as Export['uniforms']
      };

      if(embedUniforms) {
        exportData = embedUniformsIfPossible(exportData);
      }

      if(includeReadme) {
        exportData.readme = readmeText;
      }

      if(includeImages) {
        const encodedImages = extractImageData(program);

        exportData.data = {
          ...exportData.data,
          encodedImages
        };
      }

      resolve(exportData);
    }
  )();
});