<script lang="ts">
	import Interface from './components/interface/Interface.svelte';
	import Page from './components/page/Page.svelte';
	import SubstrateRenderer from './components/substrate/SubstrateRenderer.svelte';

</script>

<Page>
	<Interface />
	<SubstrateRenderer />
</Page>


<style lang="scss">
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