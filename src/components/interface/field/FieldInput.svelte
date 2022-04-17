<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';

  import { isNode } from '../../../interface/program/utils';
  import type { Field } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import FieldBoolInput from './FieldBoolInput.svelte';
  import FieldChoiceInput from './FieldChoiceInput.svelte';
  import FieldRangeInput from './FieldRangeInput.svelte';
    
  let isLocked = false;

  export let name: string;
  export let field: Field;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {};

  $: isLocked = isNode(field.value);
  const type = typeof field.value;

  let Component: typeof SvelteComponentDev;

  if(field.kind === 'choice') {
    Component = FieldChoiceInput;
  } else if(/*isLocked || */ type === 'number') {
    Component = FieldRangeInput;
  } else if(type === 'boolean') {
    Component = FieldBoolInput;
  } else {
    // NOTE: default for now
    Component = FieldRangeInput;
  }
</script>

<div class="field-wrapper">
  <svelte:component this={Component}
    name={name}
    field={field}
    onChange={onChange}
    disabled={isLocked}
  />
</div>

<style>
  .field-wrapper {
    border: 1px solid var(--cFg);
    margin: 0.5em 0.0em;
    padding: 0.4em;

    border-radius: 10px;
  }
</style>