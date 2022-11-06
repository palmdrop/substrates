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
  export let onChange: ChangeCallback | undefined = undefined;
  export let onChangeCommited: ChangeCallback;

  $: visibleFields = Object.entries(node.fields)
    .filter(entry => !entry[1].internal && !entry[1].hidden);

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
    onChange?.(value, field as Field<number | boolean>, name);
  };
</script>

<div class="node-controller">
  <h1>
    <span class="node">node</span><br>
    <span class="title">{ camelCaseToTitleCase(node.name ?? node.type) }</span>
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

    width: var(--sidebarWidth);
    margin-top: -1px;
    padding-bottom: 5em;

    pointer-events: all;
    z-index: 1;

    background-color: var(--cBg);
    border: 1px solid var(--cFg);

    overflow-x: hidden;
    overflow-y: auto;
  }

  h1 {
    text-transform: lowercase;
  }

  h1 .node {
    text-transform: lowercase;
    opacity: 0.5;
  }

  h1 .title {
    text-transform: uppercase;
  }
</style>
