<script lang="ts">
  import type { Field } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  export let name: string;
  export let field: Field<number>;
  export let disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {};

  const id = `${ name }-${ field.kind }`;
  const min = typeof field.min === 'number' ? field.min : 0.0;
  const max = typeof field.max === 'number' ? field.max : 1.0;
  const step = field.type === 'int' ? 1.0 : (max - min) / 100.0;

  const handelChange = (e: Event) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    let value = Number.parseFloat(e.target.value);
    if(isNaN(value)) return;

    if(field.type === 'int') {
      value = Math.floor(value);
    }

    value = Math.min(Math.max(min, value), max);

    field.value = value;

    // TODO: throttle?
    onChange(field.value, field);
  };

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
      step={step}
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
    step={step}
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
