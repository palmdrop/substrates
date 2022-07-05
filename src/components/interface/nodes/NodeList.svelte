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
  { #each Object.entries(groups) as [name, group] (name) }
  <div class="group">
    <Dropdown 
      items={group}
      let:item
      labelText={name}
    >
      <Button
        on:click={e => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          handleClick(item.name, e);
        }} 
      >
        { getButtonText(item) }
      </Button>
    </Dropdown>
  </div>
  {/each}
</div>

<style>
  .node-list {
    height: auto;
    min-width: 150px;

    pointer-events: all;

    background-color: var(--cBg);
    border: 1px solid var(--cFg);
  }
</style>
