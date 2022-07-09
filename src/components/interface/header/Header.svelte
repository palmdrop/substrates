<script lang="ts">
  import Button from '../../input/Button.svelte';
  import ProgramPicker from './ProgramPicker.svelte';

  export let onLoad: (encodedProgram: string) => void;
  export let onSave: () => void;
  export let onCapture: () => void;
  export let onReset: () => void;

  /*
    * TODO: save current session to local storage

    * Load Program
    * Save Program
    * Capture Frame 
    * Presets
    * Generator dropdown
    * About/help
    * Hide/show interface
  */
</script>

<header>
  <div class="section">
    <ProgramPicker 
      onPicked={onLoad}
    />
    <Button on:click={onSave}>
      Save
    </Button>
    <Button on:click={onCapture}>
      Capture
    </Button>
  </div>

  <div class="section">
    <Button on:click={onReset}>
      Reset
    </Button>
    <Button>
      Presets
    </Button>
  </div>

  <div class="section">
    <Button>
      Help
    </Button>
    <Button>
      Hide/Show
    </Button>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    background-color: var(--cBg);
    width: 100vw;
    max-height: 45px;

    z-index: 1;

    pointer-events: all;
  }

  .section {
    display: flex;
    width: auto;
  }
</style>