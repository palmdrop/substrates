<script lang="ts">
  import { nodeConfigs } from '../../../shader/builder/nodes';
  import { groupBy } from '../../../utils/general';

  import { NodeKey } from './../../../interface/program/nodes';
  
  import Button from '../../input/Button.svelte';

  export let onClick: (nodeName: NodeKey, event: MouseEvent) => void;

  const handleClick = (name: NodeKey, event: MouseEvent) => {
    onClick(name, event);
  };

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
          <Button
            
            on:click={e => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              handleClick(nodeConfig.name, e);
            }} 
          >
            { nodeConfig.name }
          </Button>
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
</style>
