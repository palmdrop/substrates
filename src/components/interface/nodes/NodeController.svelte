<script lang="ts">
  import { Field, Node } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import { ShaderNode } from './../../../interface/program/nodes';
  import { getUniformName } from './../../../shader/builder/utils/shader';
  import { shaderMaterial$ } from './../../../stores/shaderStore';
  import { setUniform } from './../../../utils/shader';

  import FieldInput from '../field/FieldInput.svelte';

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
      <FieldInput
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
