<script lang="ts">
  import { nodeConfigs } from '../../../shader/builder/nodes';
  import { groupBy } from '../../../utils/general';
  
  import { NodeKey } from './../../../interface/program/nodes';

  export let onClick: (nodeName: NodeKey, event: MouseEvent) => void;

  const handleClick = (event: MouseEvent) => {
    const button = event.target as HTMLButtonElement;
    const name = button.getAttribute('name') as NodeKey;
    onClick(name, event);
  };

  // const groups = Object.values(nodeConfigs).groupBy()
  const groups = groupBy(
    Object.values(nodeConfigs), ({ group }) => (group)
  );

  delete groups['system'];
</script>

<div class="node-list">
  { #each Object.entries(groups) as [name, group] (name) }
  <div class="group">
    <h3>
      { name }
    </h3>
    <ul>
      {#each group as nodeConfig }
        <li>
          <button
            name={nodeConfig.name}
            on:click={handleClick} 
          >
            { nodeConfig.name }
          </button>
        </li>
      {/each}
    </ul>
  </div>
  {/each}
</div>

<style>
  .node-list {
    background-color: black;
    padding: 0.5em;

    pointer-events: all;

    height: auto;

    border: 1px solid var(--cFg);
  }

  .group {
    padding: 0.5em;
  }

  h3 {
    font-size: 1.1rem;
    text-transform: uppercase;

    margin-bottom: 0.3em;

    text-align: center;
  }

  ul {
    display: flex;
    flex-direction: column;

    pointer-events: all;
  }

  button {
    cursor: pointer;
    margin: 0.2em;

    background-color: var(--cBg);
    color: var(--cFg);
    border: 1px solid var(--cFg);

    width: 100%;

    font-size: 1.1rem;
  }

  button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }
</style>
