<script lang="ts">
  export let active = false;
  export let noPadding = false;
  export let style = '';
</script>

<button 
  on:click
  class:active={active}
  class:padding={!noPadding}
  style={style}
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
    min-width: 80px;

    background-color: var(--cBg);
    color: var(--cFg);
    border: 1px solid var(--cFgDark);
    box-shadow: var(--glowShadow);
    border-radius: 5px;

    cursor: pointer;
    font-size: 1.1rem;

    transition: 0.2s;

    padding: 0;
    
  }

  .active, button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }

  .padding {
    padding: 0.3em 1em;
  }

</style>