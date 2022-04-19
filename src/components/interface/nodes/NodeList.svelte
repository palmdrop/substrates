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
    height: auto;

    pointer-events: all;

    background-color: var(--cBg);
    border: 1px solid var(--cFg);
  }

  .group:not(:last-child) {
    padding-bottom: 1.0em;
  }

  h3 {
    font-size: 1.1rem;
    text-transform: uppercase;

    margin-top: 0.5em;
    margin-bottom: 0.5em;

    text-align: center;
  }

  ul {
    display: flex;
    flex-direction: column;

    pointer-events: all;
  }

  button {
    width: 100%;
    min-width: 150px;

    padding: 0.3em;

    background-color: var(--cBg);
    color: var(--cFg);
    /*border: 1px solid var(--cFg);
    */
    border: none;
    border-top: 1px solid var(--cFg);
    border-bottom: 1px solid var(--cFg);
    margin: -1px 0px;

    cursor: pointer;
    font-size: 1.1rem;
  }


  button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }
</style>
