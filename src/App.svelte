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
			--cBg: #000000;
			--cFg: #ffffff;
			--cNodeBg: #000000;
			--cNodeBgHighlight: #333333;
			--cNodeBorder: #ffffff;

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