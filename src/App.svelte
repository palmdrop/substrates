<script lang="ts">
	import Interface from "./components/interface/Interface.svelte";
	import Page from "./components/page/Page.svelte";

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
			@include colorsToCSSVars( $colors );

			background-color: var(--cBg);
			color: var(--cFg);
		}
	}
</style>