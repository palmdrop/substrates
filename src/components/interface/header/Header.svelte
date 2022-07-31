<script lang="ts">
  import Button from '../../input/Button.svelte';
  import ProgramPicker from './ProgramPicker.svelte';

  export let onLoad: (encodedProgram: string) => void;
  export let onSave: () => void;
  export let onCapture: () => void;
  export let onReset: () => void;
  export let onToggleVisible: () => void;
  export let programVisible = true;

  /*
    * Presets
    * Generator dropdown
  */
</script>

<header>
  <div class="section">
    <ProgramPicker 
      onPicked={onLoad}
    >
      load
    </ProgramPicker>
    <Button on:click={onSave}>
      save
    </Button>
  </div>

  <div class="section">
    <Button on:click={onCapture}>
      capture
    </Button>
    <Button on:click={onReset}>
      reset
    </Button>
    <Button>
      presets
    </Button>
  </div>

  <div class="section">
    <Button
      on:click={onToggleVisible}
      active={!programVisible}
    >
      {#if programVisible }
        hide
      {:else}
        show
      {/if}
    </Button>
    <Button>
      about
    </Button>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    background-color: var(--cBg);
    height: 2.5em;
    padding: 2px;

    z-index: 1;

    pointer-events: all;

    border-bottom: 1px solid var(--cFg);
  }

  .section {
    display: flex;
    gap: 0.5em;
    min-width: calc(var(--sidebarWidth) - 3px);
  }
</style>