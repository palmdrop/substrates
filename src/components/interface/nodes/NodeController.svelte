<script lang="ts">
  import { Field, Node } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import { ShaderNode } from './../../../interface/program/nodes';
  import { getUniformName } from './../../../shader/builder/utils/shader';
  import { additionalShaderMaterials$, shaderMaterial$ } from './../../../stores/shaderStore';
  import { camelCaseToTitleCase } from './../../../utils/general';
  import { setUniform } from './../../../utils/shader';
  
  import NodeFieldInput from '../field/NodeFieldInput.svelte';

  export let node: Node;
  export let onChange: ChangeCallback;
  export let onChangeCommited: ChangeCallback;

  $: visibleFields = Object.entries(node.fields)
    .filter(entry => !entry[1].internal);

  const handleChange = (value: unknown, field: Field, name: string) => {
    const uniformName = getUniformName(node as ShaderNode, name) ;

    if($shaderMaterial$) {
      setUniform(
        uniformName,
        value,
        $shaderMaterial$
      );
    }

    $additionalShaderMaterials$.forEach(material => {
      setUniform(
        uniformName,
        value,
        material
      );
    });

    // TODO: cast for now
    onChange(value, field as Field<number | boolean>, name);
  };
</script>

<div class="node-controller">
  <h1>
    node: <span>{ camelCaseToTitleCase(node.name ?? node.type) }</span>
  </h1>
  <section>
    { #each visibleFields as [name, field] (field) }
      <NodeFieldInput
        name={name}
        field={field}
        onChange={handleChange}
        onChangeCommited={onChangeCommited}
      />
    {/each}
  </section>
</div>

<style>
  .node-controller {
    display: flex;
    flex-direction: column;

    width: 13em;

    pointer-events: all;
    z-index: 1;

    background-color: var(--cBg);
    border: 1px solid var(--cFgDark);
  }

  h1 {
    font-size: 1.5rem;
    text-transform: lowercase;
  }

  h1 span {
    white-space: nowrap;
  }
</style>
