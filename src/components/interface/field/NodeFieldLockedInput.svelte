<script lang="ts">
  import { isNode } from '../../../interface/program/utils';
  import type { Field } from '../../../interface/types/nodes';
import { camelCaseToTitleCase } from '../../../utils/general';
  import type { ChangeCallback } from '../types';

  export let name: string;
  export let field: Field<any>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback = () => {}; // does nothing in this field input type
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: ChangeCallback = () => {}; // does nothing in this field input type
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
      { camelCaseToTitleCase(name, true) }
    </label>
    <div class="locked">{ message }</div>
  </div>
</div>

<style>
  .field-input > div {
    display: flex;
    justify-content: space-between;
  }

  .locked {
    opacity: 0.5;
  }

</style>
