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

<svelte:component this={Component}
  name={name}
  field={field}
  onChange={onChange}
  disabled={isLocked}
/>