<script lang="ts">
  import { slide } from 'svelte/transition';
  // If explicitly set, the component is controlled. Otherwise, it's controlled internally
  export let initialState: 'expanded' | 'minimized' = 'expanded';
  export let expanded: boolean | undefined = undefined;
  export let onToggle: (expanded: boolean) => void = () => { return; };

  export let items: any[];
  export let labelText: string | undefined = undefined;

  let isExpanded = expanded ?? initialState === 'expanded';

  $: handleToggle = () => {
    onToggle?.(!isExpanded);
    if(typeof expanded !== 'undefined') return;
    isExpanded = !isExpanded;
  };

  const id = Math.random();
</script>

<div class="dropdown">
  <div class="header">
    <button 
      on:click={handleToggle}
      class:expanded={isExpanded}
      id="toggle-button-{id}"
    >
      > 
    </button> 
    {#if labelText} 
      <label
        for="toggle-button-{id}"
      >
        { labelText }
      </label>
    {/if}
  </div>
  {#if isExpanded}
    <ul
      transition:slide|local
    >
      {#each items as item, index (item)}
        <li>
          <slot {item} {index} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .header {
    padding: 0.3em;
  }

  label {
    font-size: 1.2rem;
    cursor: pointer;

    width: 100%;
  }


  button {
    background: unset;
    border: unset;
    cursor: pointer;

    color: var(--cFg);
    font-size: 1.2rem;

    margin-left: 0.4em;

    transition: 0.3s;

    transform: rotate(0);
  }

  .expanded {
    transform: rotate(90deg);
  }

  ul {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
</style>
