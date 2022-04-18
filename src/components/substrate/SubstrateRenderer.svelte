<script lang="ts">
  import { debounce, fromEvent, interval } from 'rxjs';

  import { substrateScene$ } from '../../stores/substrateStore';

  import { shaderMaterial$ } from './../../stores/shaderStore';
  import { SubstrateScene } from './../../substrate/SubstrateScene';

  let substrateScene: SubstrateScene;
  const onMount = (canvas: HTMLCanvasElement) => {
    substrateScene = new SubstrateScene(
      canvas
    );

    substrateScene$.set(substrateScene);

    substrateScene.start();

    shaderMaterial$.subscribe(material => {
      substrateScene.setShaderMaterial(material);
    });

    fromEvent(window, 'resize')
      .pipe(debounce(() => interval(100)))
      .subscribe(() => substrateScene.resize());
  };
</script>

<canvas 
  use:onMount
/>

<style>
  canvas {
    position: fixed;
    width: 100vw;
    height: 100vh;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
</style>