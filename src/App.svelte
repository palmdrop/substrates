<script lang="ts">
	import Interface from './components/interface/Interface.svelte';
	import Page from './components/page/Page.svelte';

</script>

<Page>
	<Interface 
	/>
</Page>


<style lang="scss">
	:global {
		@import './theme/theme.module.scss';
		@import './theme/utils.scss';
		:root {
			// TODO: move colors to regular css vars...
			@include colorsToCSSVars( $colors );

			--padding-0: 0;
			--padding-1: 2;
			--padding-2: 10;
			--padding-3: 20;
			--padding-4: 45;

			--displayFont: 'sans-serif';
			--regularFont: 'serif';

			background-color: var(--cBg);
			color: var(--cFg);

		}
	}
</style>