<script lang="ts">
  import { isNode } from '../../../interface/program/utils';
  import type { Field } from '../../../interface/types/nodes';
  import type { ChangeCallback } from '../types';

  export let name: string;
  export let field: Field<any>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {}; // does nothing in this field input type
  $: isConnected = isNode(field.value);

  let message: string;
  $: {
    if(isConnected) {
      message = 'connected';
    } else {
      if(field.internalOptional) {
        message = 'from shader';
      } else {
        message = 'disconnected';
      }
    }
  }

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
  <div>
    <label
      for={id}
    >
      { name }
    </label>
    <div class="locked">{ message }</div>
  </div>
</div>

<style>
  .field-input > div {
    display: flex;
    justify-content: space-between;

    padding-bottom: 0.5rem;
  }

  .locked {
    opacity: 0.5;
  }

</style>
