import * as THREE from 'three';

export const createDitheringTexture = (ditheringImagePath: string, onLoad?: (texture: THREE.Texture) => void) => {
  const texture = new THREE.TextureLoader().load(
    ditheringImagePath,
    onLoad
  );

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;

  return texture;
};
