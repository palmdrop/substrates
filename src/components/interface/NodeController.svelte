<script lang="ts">
	import type { Node } from './../../interface/types/nodes';
  export let node: Node;
</script>

<div class="node-controller">
  <h2>
    { node.type }
  </h2>
  <section>
    { #each Object.entries(node.fields) as [name, field] }
      <h3>
        { name }
      </h3> 
      <div>
        { field.value }
      </div>
    {/each}
  </section>
</div>

<style>
  .node-controller {
    display: flex;
    flex-direction: column;

    z-index: 10;
  }

  h2 {
    font-size: 2.5rem;
  }

  h3 {
    font-size: 1.1rem;
  }
</style>
