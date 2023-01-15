import * as THREE from 'three';
import { WebGLRenderTarget } from 'three';

export const createFeedbackPipeline = (renderer: THREE.WebGLRenderer) => {
  const size = renderer.getSize(new THREE.Vector2());

  const currentRenderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter,
    wrapS: THREE.MirroredRepeatWrapping,
    wrapT: THREE.MirroredRepeatWrapping,
  });

  const previousRenderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter,
    wrapS: THREE.MirroredRepeatWrapping,
    wrapT: THREE.MirroredRepeatWrapping,
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  const camera = new THREE.OrthographicCamera(
    -0.5, 0.5,
    0.5, -0.5,
    0, 1000
  );

  const plane = new THREE.Mesh<THREE.PlaneBufferGeometry, THREE.MeshBasicMaterial | THREE.ShaderMaterial>(
    new THREE.PlaneBufferGeometry(1.0, 1.0),
    new THREE.MeshBasicMaterial({ color: 'black' })
  );

  scene.add(plane);

  const renderScene = new THREE.Scene();

  const updateUniforms = (feedbackUniforms: string[], renderTarget: WebGLRenderTarget) => {
    feedbackUniforms.forEach(uniformName => {
      const material = plane.material as THREE.ShaderMaterial;
      if(material.uniforms && material.uniforms[uniformName]) {
        material.uniforms[uniformName].value = renderTarget.texture;
      }
    });
  };

  const targets = {
    currentRenderTarget,
    previousRenderTarget
  };

  const render = (feedbackUniforms: string[]) => {
    if(feedbackUniforms.length) {
      updateUniforms(feedbackUniforms, targets.previousRenderTarget);

      renderer.setRenderTarget(targets.currentRenderTarget);
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.clear();

      renderScene.background = targets.previousRenderTarget.texture;
      renderer.render(renderScene, camera);

      // Swap
      const temp = targets.currentRenderTarget;
      targets.currentRenderTarget = targets.previousRenderTarget;
      targets.previousRenderTarget = temp;
    } else {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
    }
  };

  const updateMaterial = (shaderMaterial: THREE.ShaderMaterial) => {
    plane.material = shaderMaterial;
  };

  const setSize = (width: number, height: number, pixelRatio: number = 1) => {
    renderer.setPixelRatio(pixelRatio);

    renderer.setSize(width, height);
    currentRenderTarget.setSize(width, height);
    previousRenderTarget.setSize(width, height);
  };

  return {
    render,
    updateMaterial,
    setSize,
  };
};