<script lang="ts">
  import { Subscription } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  import type * as THREE from 'three';
  import { Program } from '../../interface/types/program/program';
  import { decodeProgram, EncodedProgram, updateShaderMaterial } from '../../stores/programStore';
  import { SubstrateScene } from '../../substrate/SubstrateScene';
  import { setUniform } from '../../utils/shader';

  export let programData: EncodedProgram;
  export let animate: boolean | number = true;
  export let uniformOverrides: { [uniformName: string]: any } = {};
  export let scale: number | ((currentScale: number) => void) | undefined = undefined;
  export let style: string | undefined = undefined;

  export let active: boolean = !!animate;
  $: {
    active = !!animate;
  }

  let substrateScene: SubstrateScene;
  let shaderMaterial: THREE.ShaderMaterial;
  let resizeSubscription: Subscription;

  let parent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const onParentMount = (parentElement: HTMLDivElement) => {
    parent = parentElement;
  };

  const onCanvasMount = (canvasElement: HTMLCanvasElement) => {
    canvas = canvasElement;
  };

  const setupSubstrateScene = (program: Program) => {
    substrateScene = new SubstrateScene(canvas);
    shaderMaterial = updateShaderMaterial(program, false);

    const feedbackTextureUniforms: string[] = [];
    Object.keys(shaderMaterial.uniforms).forEach(uniformName => {
      if(!uniformName.startsWith('uTFeedback')) return;
      feedbackTextureUniforms.push(uniformName);
    });

    substrateScene.setShaderMaterial(shaderMaterial, program, { feedbackTextureUniforms })
    substrateScene.resize(parent.clientWidth, parent.clientHeight);

    if(uniformOverrides.time) substrateScene.setTime(uniformOverrides.time)
  }

  $: {
    if(shaderMaterial) {
      Object
        .keys(uniformOverrides)
        .forEach(
          uniformName => setUniform(uniformName, uniformOverrides[uniformName], shaderMaterial)
        );
    }
  }

  let initialScale: number | undefined = undefined;
  $: {
    if(typeof scale !== 'undefined' && shaderMaterial) {
      const scaleUniformName = Object.keys(shaderMaterial.uniforms).find(key => key.includes('uScale_'));

      if(scaleUniformName) {
        if(typeof initialScale === "undefined") {
          initialScale = shaderMaterial.uniforms[scaleUniformName].value as number;
        }

        const scaleValue = typeof scale === 'number'
          ? scale
          : scale(initialScale);

        setUniform(scaleUniformName, scaleValue, shaderMaterial);
      }
    }
  }

  $: {
    if(substrateScene) {
      if(animate) {
        if(typeof animate === "number") {
          const initialFrame = substrateScene.getFrame();
          substrateScene.start(
            () => {
              const currentFrame = substrateScene.getFrame();
              if(currentFrame - initialFrame > animate) {
                active = false;
                substrateScene.stop();
              }
            }
          );
        } else {
          substrateScene.start();
        }
      } else {
        substrateScene.stop();
        substrateScene.update();
        substrateScene.render();
        substrateScene.render();
      }
    }
  }

  onMount(() => {
    decodeProgram(programData)
      .then(program => {
        if(!program) throw new Error('Program did not compile, ', programData);
        setupSubstrateScene(program);

        new ResizeObserver(() => {
          substrateScene?.resize(parent.clientWidth, parent.clientHeight);
          if(!animate) {
            setTimeout(() => {
              substrateScene.update();
              substrateScene.render();
              substrateScene.render();
            }, 0);
          }
        }).observe(parent);
      });
  });

  onDestroy(() => {
    substrateScene?.stop();
    resizeSubscription?.unsubscribe();
  });
</script>

<div 
  use:onParentMount
  class="canvas-container"
  { style }
>
  <canvas 
    use:onCanvasMount
  />
</div>

<style>
  .canvas-container {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
  }

  canvas {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
  }
</style>