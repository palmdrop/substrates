<script lang="ts">
  import type { StaticField } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  type Callback = ChangeCallback<StaticField<boolean>>;

  export let name: string;
  export let field: StaticField<boolean>;
  export let disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: Callback = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: Callback = () => {};

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
    on:change={() => {
      onChange(field.value, field, name);
      onChangeCommited(field.value, field, name);
    }}
  />
</div>

<style>
  .field-input {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  div, div > * {
    cursor: pointer;
  }

  input {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    padding: 0;

    accent-color: var(--cFg);
    border: 1px solid white;
    outline: none;
    border-radius: 0;

    opacity: 0.7;
  }
  
  input:checked, input:hover {
    opacity: 1.0;
  }

  label {
    width: 100%;
    height: 100%;
    margin: 0.2em 0.0em;
  }
</style>
