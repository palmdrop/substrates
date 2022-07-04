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

    width: 100%;

    padding: 0;

    background-color: var(--cBg);
    color: var(--cFg);
    border: none;
    border: 1px solid var(--cFg);
    margin: -1px -1px;

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