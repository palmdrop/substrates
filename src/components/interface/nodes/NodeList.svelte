<script lang="ts">
  import { nodeConfigs } from '../../../shader/builder/nodes';
  import { NodeConfig } from '../../../shader/types/programBuilder';
  import { camelCaseToTitleCase, groupBy } from '../../../utils/general';
  
  import { NodeKey } from './../../../interface/program/nodes';
  
  import Dropdown from '../../common/Dropdown.svelte';
  import Button from '../../input/Button.svelte';

  export let onClick: (nodeName: NodeKey, event: MouseEvent) => void;

  // NOTE: Some things about this file messes with the Svelte language server.
  // NOTE: Also some TS errors I didn't manage to solve. Everything works as it should though.

  const groups = groupBy(
    Object.values(nodeConfigs), ({ group }) => group
  );

  const handleClick = (item: NodeConfig, event: MouseEvent) => {
    onClick((item.name as NodeKey), event);
  };

  delete groups['system'];

  const getButtonText = (item: NodeConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return camelCaseToTitleCase(item.name).toLocaleLowerCase();
  };
</script>

<div class="node-list">
  <h1>palette</h1>
  { #each Object.entries(groups) as [name, group] (name) }
  <div class="group">
    <Dropdown 
      items={group}
      initialState="minimized"
      labelText={name}
      style="
        min-width: 160px; 
        padding: 3px;
      "
      let:item
    >
      <Button
        style="
          margin: 2px 0px;
        "
        on:click={e => handleClick(item, e)} 
      >
        { getButtonText(item) }
      </Button>
    </Dropdown>
  </div>
  {/each}
</div>

<style>
  .node-list {
    min-width: var(--sidebarWidth);
    pointer-events: all;
    background-color: var(--cBg);
    overflow: scroll;
    border: 1px solid var(--cFg);

    padding-bottom: 5em;
  }
</style>
