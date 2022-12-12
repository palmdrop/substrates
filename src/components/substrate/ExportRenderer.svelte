<script lang="ts">
  import { Subscription } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  
  import { Export } from '../../shader/tools/export';
  import { createSubstrateSceneFromExport } from '../../substrate/exportScene';
  import { setUniform } from '../../utils/shader';

  import { SubstrateScene } from './../../substrate/SubstrateScene';

  export let exportData: Export;
  export let setup: ((substrateScene: SubstrateScene, canvas: HTMLCanvasElement) => void) | undefined = undefined;
  export let onError: ((error: any) => void) | undefined = undefined;
  export let animate = true;
  export let uniformOverrides: { [uniformName: string]: any } = {};
  export let style: string | undefined = undefined;

  let substrateScene: SubstrateScene;
  let resizeSubscription: Subscription;

  let parent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const onParentMount = (parentElement: HTMLDivElement) => {
    parent = parentElement;
  };

  const onCanvasMount = (canvasElement: HTMLCanvasElement) => {
    canvas = canvasElement;
    createSubstrateSceneFromExport(exportData, canvas).then(scene => {
      substrateScene = scene;
      substrateScene.resize(parent.clientWidth, parent.clientHeight);

      const shaderMaterial = substrateScene.getShaderMaterial();
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

      setup?.(substrateScene, canvas);
    }).catch(error => {
      onError?.(error);
    });
  };

  
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