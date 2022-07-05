<script lang="ts">
  import { camelCaseToTitleCase } from '../../../utils/general';

  import { ChoiceField } from './../../../interface/types/nodes';
  import { ChangeCallback } from './../types';

  type Callback = ChangeCallback<ChoiceField>;

  export let name: string;
  export let field: ChoiceField;
  export let disabled: boolean; // NOTE: unused for now

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: Callback = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: Callback = () => {};

  const handelChange = (e: Event) => {
    // TODO: should probably be abstracted to helper function!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const choice = (e.target as any).value as string;
    const value = field.choices[choice];
    field.value = value;

    onChange(value, field, name);
    onChangeCommited(value, field, name);
  };

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
  <label for={id}>
    { camelCaseToTitleCase(name, true) }
  </label>
  <select
    id={id}
    on:change={handelChange}
    disabled={disabled}
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

<style>
  .field-input {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  select {
    padding: 0;
    margin: 0;

    font-size: 0.9rem;
    border: 1px solid var(--cFg);
    outline: none;

    background-color: var(--cBg);
    color: var(--cFg);
  }
</style>