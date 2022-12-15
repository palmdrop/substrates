<script lang="ts">
  import { Subscription } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  import type * as THREE from 'three';
  import { Program } from '../../interface/types/program/program';
  import { decodeProgram, EncodedProgram, updateShaderMaterial } from '../../stores/programStore';
  import { SubstrateScene } from '../../substrate/SubstrateScene';
  import { setUniform } from '../../utils/shader';

  export let programData: EncodedProgram;
  export let animate = true;
  export let uniformOverrides: { [uniformName: string]: any } = {};
  export let style: string | undefined = undefined;

  let program: Program;
  let shaderMaterial: THREE.ShaderMaterial;

  decodeProgram(programData)
    .then(decodeProgram => {
      if(!program) return;
      program = decodeProgram!;
      shaderMaterial = updateShaderMaterial(program) as unknown as THREE.ShaderMaterial;
    });

  let substrateScene: SubstrateScene;
  let resizeSubscription: Subscription;

  let parent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const onParentMount = (parentElement: HTMLDivElement) => {
    parent = parentElement;
  };

  const onCanvasMount = (canvasElement: HTMLCanvasElement) => {
    canvas = canvasElement;
  };

  const setupSubstrateScene = () => {
    substrateScene = new SubstrateScene(canvas);
    shaderMaterial = updateShaderMaterial(program);
    substrateScene.setShaderMaterial(shaderMaterial)
    substrateScene.resize(parent.clientWidth, parent.clientHeight);
    
    Object.keys(uniformOverrides).forEach(uniformName => {
      setUniform(uniformName, uniformOverrides[uniformName], shaderMaterial);
    })

    if(uniformOverrides.time) substrateScene.setTime(uniformOverrides.time)

    if(animate) {
      substrateScene.start();
    } else {
      substrateScene.update();
      substrateScene.render();
      substrateScene.render();
    }
  }

  $: {
    if(canvas && program) {
      setupSubstrateScene();
    }
  }
  
  onMount(() => {
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
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>