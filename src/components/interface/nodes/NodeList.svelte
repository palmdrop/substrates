<script lang="ts">
  /** eslint-disable @typescript-eslint/no-unsafe-member-access */
  import { nodeConfigs } from '../../../shader/builder/nodes';
  import { camelCaseToTitleCase, groupBy } from '../../../utils/general';

  import { NodeKey } from './../../../interface/program/nodes';
  
  import Dropdown from '../../common/Dropdown.svelte';
  import Button from '../../input/Button.svelte';

  export let onClick: (nodeName: NodeKey, event: MouseEvent) => void;

  const handleClick = (name: NodeKey, event: MouseEvent) => {
    onClick(name, event);
  };

  const groups = groupBy(
    Object.values(nodeConfigs), ({ group }) => (group)
  );

  delete groups['system'];

  const getButtonText = (item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return camelCaseToTitleCase(item.name as string).toLocaleLowerCase();
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
        on:click={e => handleClick(item.name, e)} 
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
  }
</style>
