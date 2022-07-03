<script lang="ts">
	import { createDefaultProgram } from './interface/program/Program';
	import { initializeProgramStore, loadProgramFromString, PROGRAM_STORAGE_KEY, subscribeToProgram } from './stores/programStore';
	
	import Interface from './components/interface/Interface.svelte';
	import Page from './components/page/Page.svelte';
	import SubstrateRenderer from './components/substrate/SubstrateRenderer.svelte';

	let program = (() => {
	  const encodedProgram = localStorage.getItem(PROGRAM_STORAGE_KEY);
	  if(encodedProgram) {
	    const program = loadProgramFromString(encodedProgram);
	    if(program) return program;
	  }

	  return createDefaultProgram();
	})();
	
	initializeProgramStore(program);

	subscribeToProgram(newProgram => {
	  program = newProgram;
	});

	let canvas: HTMLCanvasElement;
	const onCanvasMount = (canvasRef: HTMLCanvasElement) => {
	  canvas = canvasRef;
	};
</script>

<Page>
	<canvas use:onCanvasMount />
	<Interface {canvas} {program}/>
	<SubstrateRenderer />
</Page>


<style lang="scss">
  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }

	:global {
		:root {
			--cBg: #28282b;
			--cFg: #e2dcd5;
			--cNodeBg: #28282b;
			--cNodeBgHighlight: #4e4c57;
			--cNodeBorder: #e2dcd5;
			--cNodeActiveBorder: #00ff00;

			--cNodeConnectionFloat: #ff9100;
			--cNodeConnectionVec3: #de78f2;

			--padding-0: 0;
			--padding-1: 4;
			--padding-2: 15;
			--padding-3: 25;
			--padding-4: 50;

			--displayFont: 'sans-serif';
			--regularFont: 'serif';

			background-color: var(--cBg);
			color: var(--cFg);
		}
	}
</style>