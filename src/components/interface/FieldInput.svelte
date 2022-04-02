<script lang="ts">
  import { isNode } from "../../interface/program/utils";
  import type { Field } from "../../interface/types/nodes";
import type { OnChange } from "./types";

  export let name: string;
  export let field: Field;
  export let min: number = -1.0;
  export let max: number = 1.0;

  export let onChange: OnChange = () => {};

  const id = `${name}-${field.type}`;
  $: isLocked = isNode(field.value);

  const handelChange = (e: Event) => {
    e.preventDefault();

    const value = Number.parseFloat((e.target as any).value);
    if(isNaN(value)) return;

    field.value = value;

    // TODO: throttle?
    onChange(field.value, field);
  }
</script>

<div>
  <label
    for={id}
  >
    { name }
  </label>
  <input
    id={id}
    type="number"
    step={0.01}
    value={field.value}
    on:input={handelChange}
    disabled={isLocked}
    min={min}
    max={max}
  />
  <input
    id={id}
    type="range"
    step={0.01}
    value={field.value}
    on:input={handelChange}
    disabled={isLocked}
    min={min}
    max={max}
  />
</div>

<style>
  div {
    margin-bottom: 0.7em;
  }

  input {
    margin-top: 0.2em;
  }

</style>
