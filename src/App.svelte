<script lang="ts">
	import { UAParser } from 'ua-parser-js';
	
	import { createDefaultProgram } from './interface/program/Program';
	import { Program } from './interface/types/program/program';
	import { initializeProgramStore, loadProgramFromString, PROGRAM_STORAGE_KEY, subscribeToProgram } from './stores/programStore';
	
	import Button from './components/input/Button.svelte';
	import Interface from './components/interface/Interface.svelte';
	import Page from './components/page/Page.svelte';
	import SubstrateRenderer from './components/substrate/SubstrateRenderer.svelte';

	export let loadFromLocalStorage = true;

	let program: Program;

	// let program = (() => {
	if(loadFromLocalStorage) {
	  const encodedProgram = localStorage.getItem(PROGRAM_STORAGE_KEY);
	  if(encodedProgram) {
	    loadProgramFromString(encodedProgram)
	      .then(loadedProgram => {
	        program = loadedProgram;
	      })
	      .catch(err => {
	        console.error(err);
	        program = createDefaultProgram();
	      });
	  }
	} else {
	  program = createDefaultProgram();
	}

	// })();
	$: {
	  if(program) {
	    initializeProgramStore(program);
	  }
	}

	subscribeToProgram(newProgram => {
	  program = newProgram;
	});

	let canvas: HTMLCanvasElement;
	const onCanvasMount = (canvasRef: HTMLCanvasElement) => {
	  canvas = canvasRef;
	};

	// Detect mobile
	let appActive = false;
	let appWarning = false;

	const deviceType = new UAParser().getDevice().type;
	if(
	  !localStorage.getItem('ignoreWarning') &&
		([UAParser.DEVICE.MOBILE, UAParser.DEVICE.WEARABLE] as string[]).includes(deviceType as string)
	) {
	  appWarning = true;
	} else {
	  appActive = true;
	}
</script>

<Page>
	{#if appWarning}
		<section class="mobile-warning">
			<h1>Warning!</h1>
			<p>This application is computationally intensive and does not support mobile layouts. Continue anyway?</p>
			<Button
				on:click={() => {
					appWarning = false;
					appActive = true;
					localStorage.setItem('ignoreWarning', 'true');
				}}
				style="font-size: 2rem;"
			>
				Continue
			</Button>
		</section>
	{/if}
	{#if appActive && program}
		<canvas use:onCanvasMount />
		<Interface {canvas} {program}/>
		<SubstrateRenderer />
	{/if}
</Page>


<style lang="scss">
	.mobile-warning {
		position: relative;
		top: 50%;
		transform: translateY(-50%);
		max-width: 500px;
		margin: auto;		
		font-size: 1.5rem;
		padding: 0.3em;

		h1 {
			margin-bottom: 0.5em;
			font-size: 3rem;
		}

		p {
			margin-bottom: 1.0em;
		}
	}

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }

	:global {
		:root {
			--cBg: #020202;
			--cFg: #e7eced;
			--cFgBleak: rgb(144, 144, 144);
			--cFgDark: #6a6a6a;
			--cNodeBg: var(--cBg);
			--cNodeAnchorHighlight: var(--cFgDark);
			--cNodeBgHighlight: #000000;
			--cNodeBorder: var(--cFg);
			--cNodeActiveBorder: #00ff00;

			--cNodeConnectionFloat: #ff9100;
			--cNodeConnectionVec3: #de78f2;

			--glowShadow:
				inset 0px 0px 8px rgb(149, 154, 112),
				3px 3px 8px rgba(83, 99, 111, 0.475);

			--padding-0: 0;
			--padding-1: 4;
			--padding-2: 15;
			--padding-3: 25;
			--padding-4: 50;

			--displayFont: 'SyneBold';
			--accentFont: 'SyneItalic';
			--regularFont: 'SyneRegular';

			--sidebarWidth: 12em;

			background-color: var(--cBg);
			color: var(--cFg);

		}

    * {
      font-family: var(--regularFont);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--displayFont);
    }

    h1 {
      padding: 1.0rem;
      font-size: 1.2rem;
      background-color: var(--cFg);
      color: var(--cBg);
    }
	}
</style>