<script lang="ts">
  import { nodeCreatorMap,NodeKey } from './../../../interface/program/nodes';

  export let onClick: (nodeName: NodeKey, event: MouseEvent) => void;

  const handleClick = (event: MouseEvent) => {
    const button = event.target as HTMLButtonElement;
    const name = button.getAttribute('name') as NodeKey;
    onClick(name, event);
  };

  const nodeNames = Object.keys(nodeCreatorMap).filter(name => name !== 'root');
</script>

<ul>
  {#each nodeNames as name }
    <li>
      <button
        name={name}
        on:click={handleClick} 
      >
        { name }
      </button>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-direction: column;

    pointer-events: all;
  }

  button {
    cursor: pointer;
  }
</style>
