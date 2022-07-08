<script lang="ts">
  export let noPadding = false;
</script>

<button 
  on:click
  class:padding={!noPadding}
>
  <slot />
</button>

<style>
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: calc(100% - 6px);

    background-color: var(--cBg);
    color: var(--cFg);
    border: 1px solid var(--cFgBleak);
    outline: 1px solid var(--cFgDark);
    outline-offset: 1px;
    border-radius: 15px;
    margin: 3px;

    cursor: pointer;
    font-size: 1.1rem;
  }

  button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }

  .padding {
    padding: 0.3em;
  }

</style>