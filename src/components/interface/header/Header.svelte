<script lang="ts">
  import { loadProgramFromString } from '../../../stores/programStore';

  const handleFilePick = (e: Event & { currentTarget: HTMLInputElement }) => {
    if(!e.currentTarget.files) return;

    const file = e.currentTarget.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onloadend = (e) => {
      const data = e.target?.result as string;
      if(!data) return;
      loadProgramFromString(data);
    };

    reader.readAsText(file);
  };
</script>

<header>
  <input 
    type="file"
    multiple={ false }
    accept=".json"
    id="chooser"
    on:change={ handleFilePick } 
  />
  <label for="chooser">
    load program
  </label>
</header>

<style>
  input[type=file] {
    display: none;
  }

  header {
    display: flex;
    background-color: var(--cBg);
    width: 100vw;

    z-index: 1;

    pointer-events: all;
  }

  label {
    width: 100%;
    min-width: 150px;

    padding: 0.3em;

    background-color: var(--cBg);
    color: var(--cFg);
    border: none;
    border-top: 1px solid var(--cFg);
    border-bottom: 1px solid var(--cFg);
    margin: -1px 0px;

    cursor: pointer;
    font-size: 1.1rem;
  }

  label:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }
</style>