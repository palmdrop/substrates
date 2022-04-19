<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';

  import { isNode } from '../../../interface/program/utils';
  import type { Field } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import FieldBoolInput from './NodeFieldBoolInput.svelte';
  import FieldChoiceInput from './NodeFieldChoiceInput.svelte';
  import FieldRangeInput from './NodeFieldRangeInput.svelte';
    
  let isLocked = false;

  export let name: string;
  export let field: Field;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {};

  // TODO this component rerenderes way too often, anytime user interacts with nodes! fix!
  $: isLocked = isNode(field.value);
  $: type = typeof field.value;

  let Component: typeof SvelteComponentDev;

  $: if(field.kind === 'choice') {
    Component = FieldChoiceInput;
  } else if(type === 'number') {
    Component = FieldRangeInput;
  } else if(type === 'boolean') {
    Component = FieldBoolInput;
  } else {
    // NOTE: default for now
    Component = FieldRangeInput;
    isLocked = true;
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
    margin: 0.5em 0.0em;
    padding: 0.4em;
  }

  .field-wrapper:not(:last-child) {
    border-bottom: 1px solid var(--cFg);
  }
</style>