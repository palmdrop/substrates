<script lang="ts">
	import { buildProgramShader } from './../../shader/builder/programBuilder';
	import { SubstrateScene } from './../../substrate/SubstrateScene';

let substrateScene: SubstrateScene;
const onMount = (canvas: HTMLCanvasElement) => {
  substrateScene = new SubstrateScene(
    canvas
  );
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
    z-index: -1;
    pointer-events: none;
  }
</style>