<script lang="ts">
  import type { Field } from "../../../interface/types/nodes";
  import type { ChangeCallback } from "../types";

  export let name: string;
  export let field: Field;
  export let disabled: boolean = false;

  export let onChange: ChangeCallback = () => {};

  const id = `${name}-${field.type}`;
  const min = field.min ?? 0.0;
  const max = field.max ?? 1.0;

  const handelChange = (e: Event) => {
    e.preventDefault();

    const value = Number.parseFloat((e.target as any).value);
    if(isNaN(value)) return;

    field.value = value;

    // TODO: throttle?
    onChange(field.value, field);
  }

</script>

<div class="field-input">
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
      disabled={disabled}
      min={min}
      max={max}
    />
  </div>
  <input
    id={id}
    type="range"
    step={0.01}
    value={field.value}
    on:input={handelChange}
    disabled={disabled}
    min={min}
    max={max}
  />
</div>

<style>
  .field-input {
    margin-bottom: 0.7em;
  }

  .field-input > div {
    display: flex;
    justify-content: space-between;
  }

  input[type=number] {
    margin-top: 0.2em;
    max-width: 70px;
  }

  input[type=range] {
    width: 100%;
    cursor: pointer;
  }

</style>
