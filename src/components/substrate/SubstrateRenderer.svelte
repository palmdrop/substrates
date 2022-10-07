<script lang="ts">
  import { debounce, fromEvent, interval } from 'rxjs';

  import { substrateScene$ } from '../../stores/sceneStore';

  import { additionalDataStore$, programStore$ } from './../../stores/programStore';
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
      substrateScene.setShaderMaterial(material, $programStore$, $additionalDataStore$);
    });

    const resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounce(() => interval(100)))
      .subscribe(() => substrateScene.resize(window.innerWidth, window.innerHeight));
    
    return {
      destroy() {
        substrateScene.stop();
        resizeSubscription.unsubscribe();
      }
    };
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