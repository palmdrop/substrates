<script lang="ts">
  import { blockPropagationOnInput } from '../../../hooks/blockPropagationOnInput';
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
    if(!e.target) return;

    let value = Number.parseFloat((e.target as HTMLInputElement).value);
    if(isNaN(value)) return;

    if(field.type === 'int') {
      value = Math.floor(value);
    }

    if(field.restricted) {
      value = Math.min(Math.max(min, value), max);
    }

    field.value = value;

    onChange(field.value, field, name);
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
      use:blockPropagationOnInput
      disabled={disabled}
      pattern="[0-9]"
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
    use:blockPropagationOnInput
    disabled={disabled}
    min={min}
    max={max}
  />
</div>

<style>
  .field-input > div {
    display: flex;
    justify-content: space-between;

    padding-bottom: 0.5rem;
  }

  input[type=number] {
    max-width: 50px;
    margin: 0px -1px;
    padding-right: 3px;
    text-align: right;
    -moz-appearance: textfield;

    border: 1px solid var(--cFg);
    border-radius: 0;

    background: var(--cBg);
    color: var(--cFg);
  }

  input[type=number]:focus {
    outline-style: solid;
    outline-color: var(--cFg);
  }

  input[type=number]:disabled {
    opacity: 0.5;
  }

  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }

  input[type=range] {
    width: 100%;
    margin: 0;
    cursor: pointer;

    -webkit-appearance: none;
    appearance: none;

    border: none;
    outline: 1px solid var(--cFg);
    background-color: var(--cBg);
    opacity: 0.7;
    
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
  }

  input[type=range]:hover {
    opacity: 1;
  }

  input[type=range]:disabled {
    opacity: 0.2;
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
  }

  input[type=range]::-webkit-slider-thumb {
    background-color: var(--cFg);
    cursor: pointer;

    width: 18px;
    height: 18px;

    border: none;
    border-radius: 0;
    margin: 0;
    padding: 0;

  }

  input[type=range]::-moz-range-thumb {
    background-color: var(--cFg);
    cursor: pointer;

    width: 18px;
    height: 18px;

    border: none;
    border-radius: 0;
    margin: 0;
    padding: 0;
  }

</style>
