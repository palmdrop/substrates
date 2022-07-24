<script lang="ts">
  import { slide } from 'svelte/transition';
  // If explicitly set, the component is controlled. Otherwise, it's controlled internally
  export let initialState: 'expanded' | 'minimized' = 'expanded';
  export let expanded: boolean | undefined = undefined;
  export let onToggle: (expanded: boolean) => void = () => { return; };

  export let items: any[];
  export let labelText: string | undefined = undefined;

  export let style = '';

  let isExpanded = expanded ?? initialState === 'expanded';

  $: handleToggle = () => {
    onToggle?.(!isExpanded);
    if(typeof expanded !== 'undefined') return;
    isExpanded = !isExpanded;
  };

  const id = Math.random();
</script>

<div 
  class="dropdown"
  style={style}
>
  <div class="header" class:expanded={isExpanded}>
    <button 
      on:click={handleToggle}
      class:expanded={isExpanded}
      id="toggle-button-{id}"
    >
      ▼
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
    border: 1px solid var(--cFgDark);
    display: flex;
  }
  
  .header.expanded {
    background-color: var(--cFgDark);
  }

  label {
    font-size: 1.2rem;
    cursor: pointer;

    padding: 0.4em;
    padding-left: unset;
    line-height: 1.3;
    width: 100%;

    text-transform: lowercase;
  }

  button {
    background: unset;
    border: unset;
    cursor: pointer;

    color: var(--cFg);
    opacity: 0.7;
    font-size: 1.2rem;

    padding: 0.5em;

    transition: 0.3s;
    transform: rotate(-90deg);
  }

  button.expanded {
    transform: rotate(0);
  }

  ul {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border: 1px solid var(--cFgDark);
    border-top: unset;
  }

  li {
    margin: 0px -1px;
  }
</style>
