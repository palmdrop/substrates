<script lang="ts">
	import type { Node } from './../../interface/types/nodes';
  import FieldInput from './field/FieldInput.svelte';
  import type { ChangeCallback } from './types';

  export let node: Node;
  export let onChange: ChangeCallback;
</script>

<div class="node-controller">
  <h1>
    { node.type }
  </h1>
  <section>
    { #each Object.entries(node.fields) 
      as [name, field] 
      (field)
    }
      <FieldInput
        name={name}
        field={field}
        onChange={onChange}
      />
    {/each}
  </section>
</div>

<style>
  .node-controller {
    display: flex;
    flex-direction: column;

    max-width: 200px;

    z-index: 10;

    background-color: blue;

    padding: 1em;

    pointer-events: all;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
</style>
