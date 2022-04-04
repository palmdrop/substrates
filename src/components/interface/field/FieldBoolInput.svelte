<script lang="ts">
  import type { Field } from "../../../interface/types/nodes";
  import type { ChangeCallback } from "../types";

  export let name: string;
  export let field: Field;
  export let disabled: boolean = false;

  export let onChange: ChangeCallback = () => {};

  const id = `${name}-${field.type}`;
</script>

<div>
  <label
    for={id}
  >
    { name }
  </label>
  <input
    id={id}
    type="checkbox"
    bind:checked={field.value}
    disabled={disabled}
    on:change={() => onChange(field.value, field)}
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
