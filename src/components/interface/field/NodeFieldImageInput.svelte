<script lang="ts">
  import * as THREE from 'three';
  
  import { loadTextureFieldFromFile } from '../../../shader/builder/nodes/utils';
  import { camelCaseToTitleCase } from '../../../utils/general';

  import { StaticField } from './../../../interface/types/nodes';
  import { ChangeCallback } from './../types';

  type Callback = ChangeCallback<StaticField<THREE.Texture | null>>;

  export let name: string;
  export let field: StaticField<THREE.Texture | null>;
  export let disabled: boolean; // NOTE: unused for now

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChange: Callback = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let onChangeCommited: Callback = () => {};

  let texture: THREE.Texture | undefined = undefined;
  const onImageSelected = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if(!event.currentTarget.files) return;

    const imageFile = event.currentTarget.files[0];
    if (!imageFile) return;

    loadTextureFieldFromFile(imageFile, field)
      .then(loadedTexture => {
        texture = loadedTexture;
        onChange(texture, field, name);
        onChangeCommited(texture, field, name);
      })
      .catch(err => {
        texture = undefined;
        console.error(err);
      });
  };

  $: pickedImageName = field.value?.name;

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
  <label for={id}>
    <span>
      { camelCaseToTitleCase(name, true) }
    </span>
    <span class="image-input" class:selected={!!pickedImageName}>
      { #if pickedImageName }
        { pickedImageName }
      {:else }
        Not selected...
      {/if}
    </span>
  </label>
  <input 
    type="file"
    accept="image/png, image/jpg, image/jpeg"
    name="user[image]"
    multiple={ false }
    id={id}
    on:change={ onImageSelected } 
  />
</div>

<style>
  .field-input {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  label {
    width: 100%;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .image-input {
    margin-top: 0.2em;
    padding: 0.2em;

    border: 1px solid var(--cFg);
    border-radius: 0;

    outline: none;
    color: var(--cFgDark);
  }

  .image-input.selected {
    color: var(--cFg);
  }

  .image-input:hover {
    outline: 1px solid var(--cFg);
    outline-style: solid;
    outline-color: var(--cFg);
  }

  input {
    display: none;
  }
</style>