<script lang="ts">
  import { blockKeyboardEventsOnFocus } from '../../../hooks/blockKeyboardEventsOnFocus';
  import type { Field } from '../../../interface/types/nodes';
import { camelCaseToTitleCase } from '../../../utils/general';
  import type { ChangeCallback } from '../types';

  export let name: string;
  export let field: Field<number>;
  export let disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: ChangeCallback = () => {}; // does nothing in this field input type

  const id = `${ name }-${ field.kind }`;
  const min = typeof field.min === 'number' ? field.min : 0.0;
  const max = typeof field.max === 'number' ? field.max : 1.0;
  const step = field.type === 'int' ? 1.0 : (max - min) / 100.0;

  let hasChangedSinceLastCommit = false;
  let previousValue = field.value as number;

  let numberInputOverride = false;
  let numberInputOverrideValue: string | undefined = undefined;

  const commitValue = () => {
    onChangeCommited(field.value, field, name);
    hasChangedSinceLastCommit = false;
  };

  const onNumberFocus = () => {
    numberInputOverride = true;
  };

  const onNumberBlur = () => {
    numberInputOverrideValue = undefined;

    if(hasChangedSinceLastCommit) commitValue();
  };

  const handelChange = (e: Event) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if(!e.target) return;

    let inputValue = (e.target as HTMLInputElement).value;

    let value = Number.parseFloat(inputValue);
    if(isNaN(value)) return;

    if(field.type === 'int') {
      value = Math.floor(value);
    }

    if(field.restricted) {
      value = Math.min(Math.max(min, value), max);
    }

    if(value === previousValue) return;

    field.value = value;
    previousValue = value;

    hasChangedSinceLastCommit = true;

    if(numberInputOverride) numberInputOverrideValue = inputValue;

    onChange(field.value, field, name);
  };
</script>

<div 
  class="field-input"
>
  <div>
    <label
      for={id}
    >
      { camelCaseToTitleCase(name, true) }
    </label>
    <input
      id={id}
      type="number"
      step={step}
      value={numberInputOverrideValue ?? field.value}
      on:input={handelChange}
      on:focus={onNumberFocus}
      on:blur={onNumberBlur}
      use:blockKeyboardEventsOnFocus
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
    on:mouseup={commitValue}
    use:blockKeyboardEventsOnFocus
    disabled={disabled}
    min={min}
    max={max}
    tabindex="-1"
  />
</div>

<style>
  .field-input > div {
    display: flex;
    justify-content: space-between;

    padding-bottom: 0.5rem;
  }

  input[type=number] {
    max-width: 33px;
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
