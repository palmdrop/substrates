import * as THREE from 'three';

import { loadTextureFieldFromDataURL } from '../shader/builder/nodes/utils';
import { Export } from '../shader/tools/export';
import { SubstrateScene } from './SubstrateScene';

const createTextures = async (encodedImages: { [uniformNames: string]: { data: string } }) => {
  return (
    await Promise.all(Object.keys(encodedImages).map(async uniformName => {
      const { data } = encodedImages[uniformName];

      const texture = await loadTextureFieldFromDataURL(
        data, 'texture' 
      );

      return { uniformName, texture };
    }))
  ).reduce(
    (textures, { uniformName, texture }) => {
      textures[uniformName] = texture;
      return textures;
    }, {} as { [uniformName: string]: THREE.Texture }
  );
};

// TODO: Figure out if I can avoid using the feedback pipeline for all exports/programs... 
// TODO: can I just use regular renderer if no feedback node is present?
export const createSubstrateSceneFromExport = async (
  exportData: Export,
  canvas: HTMLCanvasElement
) => {
  const {
    uniforms,
    vertexShader,
    fragmentShader,
    data
  } = exportData;

  const feedbackTextureUniforms = Object.keys(exportData.uniforms ?? {})
    .filter(uniformName => uniformName.startsWith('uTFeedback'));

  const substrateScene = new SubstrateScene(canvas);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  if(data?.encodedImages) {
    const textures = await createTextures(data.encodedImages);
    Object.keys(textures).forEach(uniformName => {
      if(!shaderMaterial.uniforms[uniformName]) return;
      shaderMaterial.uniforms[uniformName].value = textures[uniformName];
    });
  }

  substrateScene.setShaderMaterial(
    shaderMaterial,
    undefined,
    {
      feedbackTextureUniforms
    }
  );

  return substrateScene;
};