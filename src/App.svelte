<script lang="ts">
	import { UAParser } from 'ua-parser-js';

	import { createDefaultProgram } from './interface/program/Program';
	import { Program } from './interface/types/program/program';
	import { initializeProgramStore, loadProgramFromString, PROGRAM_STORAGE_KEY, subscribeToProgram } from './stores/programStore';
	import { SubstrateScene } from './substrate/SubstrateScene';
	
	import Button from './components/input/Button.svelte';
	import Interface from './components/interface/Interface.svelte';
	import Page from './components/page/Page.svelte';
	import SubstrateRenderer from './components/substrate/SubstrateRenderer.svelte';

	export let loadFromLocalStorage = true;

	export let program: Program | undefined = undefined;
	let storeInitialized = false;

	const initializeProgram = () => {
		if(program && !storeInitialized) {
			initializeProgramStore(program);
			storeInitialized = true;
		}
	}

	const encodedProgram = localStorage.getItem(PROGRAM_STORAGE_KEY);
	if(loadFromLocalStorage && encodedProgram && !program) {
	  loadProgramFromString(encodedProgram)
	    .then(loadedProgram => {
	      program = loadedProgram;
	    })
	    .catch(err => {
	      console.error(err);
	      program = createDefaultProgram();
	    });
	} else if(!program) {
	  program = createDefaultProgram();
		initializeProgram();
	}

	
	initializeProgram();
	$: if(program) initializeProgram();

	subscribeToProgram(newProgram => {
	  program = newProgram;
	});

	export let canvas: HTMLCanvasElement | undefined = undefined;
	export let substrateCanvas: HTMLCanvasElement | undefined = undefined;
	export let substrateScene: SubstrateScene;

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
		<SubstrateRenderer 
			bind:canvas={substrateCanvas}
			bind:substrateScene={substrateScene}
		/>
	{/if}
</Page>

<style>
	.mobile-warning {
		position: relative;
		top: 50%;
		transform: translateY(-50%);
		max-width: 500px;
		margin: auto;		
		font-size: 1.5rem;
		padding: 0.3em;

	}

	.mobile-warning h1 {
		margin-bottom: 0.5em;
		font-size: 3rem;
	}

	.mobile-warning p {
		margin-bottom: 1.0em;
	}

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }

	:root {
		--cBg: #a0a0a0;
		--cFg: #1e2119;
		--cFgBleak: rgb(144, 144, 144);
		--cFgDark: #6a6a6a;
		--cNodeBg: var(--cBg);

		--cNodeAnchorHighlight: var(--cBg);
		--cNodeAnchorBorder: var(--cFgDark);

		--cNodeBgHighlight: #b1b1b1;
		--cNodeBorder: var(--cFg);
		--cNodeActiveBorder: #bbff00;

		--cNodeConnectionFloat: #fccb57;
		--cNodeConnectionVec3: #8de6a9;
		--cNodeConnectionInt: #879fdc;

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

	:global(*) {
		font-family: var(--regularFont);
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: var(--displayFont);
	}

	:global(h1) {
		padding: 1.0rem;
		font-size: 1.2rem;
		background-color: var(--cFg);
		color: var(--cBg);
	}
</style>