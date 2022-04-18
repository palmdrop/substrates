<script lang="ts">
  import type { StaticField } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  export let name: string;
  export let field: StaticField<boolean>;
  export let disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback<StaticField<boolean>> = () => {};

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
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
    on:change={() => onChange(field.value, field, name)}
  />
</div>

<style>
  div, div > * {
    cursor: pointer;
  }

  input {
    margin-top: 0.2em;
  }
</style>
