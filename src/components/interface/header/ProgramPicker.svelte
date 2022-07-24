<script lang="ts">
  import Button from '../../input/Button.svelte';

  export let onPicked: (encodedProgram: string) => void;

  const handleFilePick = (e: Event & { currentTarget: HTMLInputElement }) => {
    if(!e.currentTarget.files) return;

    const file = e.currentTarget.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = (e) => {
      const data = e.target?.result as string;
      if(!data) return;
      onPicked(data);
    };

    reader.readAsText(file);
  };
</script>

<input 
  type="file"
  multiple={ false }
  accept=".json"
  id="chooser"
  on:change={ handleFilePick } 
/>
<Button
  noPadding
>
  <label for="chooser">
    <span>Load</span>
  </label>
</Button>

<style>
  input[type=file] {
    display: none;
  }

  label {
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    cursor: pointer;
  }

  span {
    text-align: center;
    width: 100%;
    padding: 0em 1em;
  }

  label:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }
</style>