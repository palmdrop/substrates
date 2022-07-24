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

    background-color: var(--cBg);
    color: var(--cFg);
    border: 1px solid var(--cFgDark);
    border-radius: 11px;
    margin-top: -1px;

    cursor: pointer;
    font-size: 1.1rem;

    transition: 0.2s;
  }

  button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }

  .padding {
    padding: 0.3em 1em;
  }

</style>