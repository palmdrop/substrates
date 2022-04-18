<script lang="ts">
  import { Field, Node } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import { ShaderNode } from './../../../interface/program/nodes';
  import { getUniformName } from './../../../shader/builder/utils/shader';
  import { shaderMaterial$ } from './../../../stores/shaderStore';
  import { setUniform } from './../../../utils/shader';

  import NodeFieldInput from '../field/NodeFieldInput.svelte';

  export let node: Node;
  export let onChange: ChangeCallback;

  $: visibleFields = Object.entries(node.fields)
    .filter(entry => !entry[1].internal);

  const handleChange = (value: any, field: Field, name: string) => {
    const uniformName = getUniformName(node as ShaderNode, name) ;

    if($shaderMaterial$) {
      setUniform(
        uniformName,
        value,
        $shaderMaterial$
      );
    }

    // TODO: cast for now
    onChange(value, field as Field<number | boolean>, name);
  };
</script>

<div class="node-controller">
  <h1>
    { node.type }
  </h1>
  <section>
    { #each visibleFields as [name, field] (field) }
      <NodeFieldInput
        name={name}
        field={field}
        onChange={handleChange}
      />
    {/each}
  </section>
</div>

<style>
  .node-controller {
    display: flex;
    flex-direction: column;

    max-width: 200px;
    padding: 1em;

    pointer-events: all;
    z-index: 1;

    background-color: var(--cBg);
    border: 1px solid var(--cFg);
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.7rem;

    text-transform: uppercase;
  }
</style>
