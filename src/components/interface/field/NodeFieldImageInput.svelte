<script lang="ts">
  import * as THREE from 'three';
  
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


  const onImageSelected = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if(!event.currentTarget.files) return;

    const imageData = event.currentTarget.files[0];
    if (!imageData) return;

    const reader = new FileReader();
    reader.readAsDataURL(imageData);
    reader.onloadend = () => {
      const data = reader.result as string;
      const image = new Image();

      image.onload = function() {
        const texture = new THREE.Texture();
        texture.image = image;
        texture.needsUpdate = true;
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;

        onChange(texture, field, name);
        onChangeCommited(texture, field, name);

        field.value = texture;
      }; 

      image.src = data;
    };
  };

  const id = `${ name }-${ field.kind }`;
</script>

<div class="field-input">
  <label for={id}>
    { camelCaseToTitleCase(name, true) }
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