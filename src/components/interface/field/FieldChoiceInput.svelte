<script lang="ts">
  import { ChoiceField } from './../../../interface/types/nodes';
  import { ChangeCallback } from './../types';

  export let name: string;
  export let field: ChoiceField;
  export let disabled: boolean; // NOTE: unused for now

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: ChangeCallback<ChoiceField> = () => {};

  const handelChange = (e: Event) => {
    // TODO: should probably be abstracted to helper function!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const choice = (e.target as any).value as string;
    const value = field.choices[choice];
    field.value = value;

    onChange(value, field, name);
  };

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
  <label for={id}>
    { name }
  </label>
  <select
    id={id}
    on:change={handelChange}
  >
    {#each Object.entries(field.choices) as choice (choice) }
      <option 
        value={choice[0]}
        selected={choice[1] === field.value}
      >
        { choice[0] } 
      </option> 
    {/each}

  </select>
</div>