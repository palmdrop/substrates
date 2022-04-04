<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { isNode } from "../../../interface/program/utils";
  import type { Field } from "../../../interface/types/nodes";
  import type { ChangeCallback } from "../types";
  import FieldBoolInput from "./FieldBoolInput.svelte";
  import FieldRangeInput from "./FieldRangeInput.svelte";

  export let name: string;
  export let field: Field;
  export let onChange: ChangeCallback = () => {};

  $: isLocked = isNode(field.value);
  const type = typeof field.value;

  let Component: typeof SvelteComponent;

  if(isLocked || type === 'number') {
    Component = FieldRangeInput;
  } else if(type === 'boolean') {
    Component = FieldBoolInput;
  } else {
    // NOTE: default for now
    Component = FieldRangeInput;
  }
</script>

<svelte:component this={Component}
  name={name}
  field={field}
  onChange={onChange}
  disabled={isLocked}
/>