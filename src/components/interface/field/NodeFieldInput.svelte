<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';

  import { isNode } from '../../../interface/program/utils';
  import type { Field } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  import FieldBoolInput from './NodeFieldBoolInput.svelte';
  import FieldChoiceInput from './NodeFieldChoiceInput.svelte';
  import FieldImageInput from './NodeFieldImageInput.svelte';
  import FieldLockedInput from './NodeFieldLockedInput.svelte';
  import FieldRangeInput from './NodeFieldRangeInput.svelte';
    
  export let name: string;
  export let field: Field;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: ChangeCallback = () => {};

  // TODO this component rerenderes way too often, anytime user interacts with nodes! fix!
  $: blocked = isNode(field.value);
  $: type = typeof field.value;

  let Component: typeof SvelteComponentDev;

  // TODO: rename locked input, we already have locked node
  $: if(field.inputLocked || field.internalOptional) {
    Component = FieldLockedInput;
  } else if(field.kind === 'choice') {
    Component = FieldChoiceInput;
  } else if(field.type === 'sampler2D') {
    Component = FieldImageInput;
  } else if(type === 'number') {
    Component = FieldRangeInput;
  } else if(type === 'boolean') {
    Component = FieldBoolInput;
  } else {
    // NOTE: default for now
    Component = FieldRangeInput;
    blocked = true;
  }
</script>

<div class="field-wrapper">
  <svelte:component this={Component}
    name={name}
    field={field}
    onChange={onChange}
    onChangeCommited={onChangeCommited}
    disabled={blocked}
  />
</div>

<style>
  .field-wrapper {
    padding: 0.8em 0.8em;
    border: 1px solid var(--cFgDark);

    margin: 3px;
  }
</style>