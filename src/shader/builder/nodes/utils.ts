import * as THREE from 'three';

import { StaticField } from '../../../interface/types/nodes';

export const loadTextureFieldFromDataURL = (
  data: string,
  name: string,
  field?: StaticField<THREE.Texture | null> 
): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const texture = new THREE.Texture(image);
      texture.name = name;
      texture.needsUpdate = true;

      if(field) field.value = texture;

      resolve(texture);
    }; 

    image.onerror = () => {
      reject(`${ name } is not a valid image`);
    };

    image.src = data;
  });
};

export const loadTextureFieldFromFile = (
  imageFile: File, 
  field: StaticField<THREE.Texture | null> 
): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = () => {
      const data = reader.result as string;

      loadTextureFieldFromDataURL(data, imageFile.name, field)
        .then(texture => resolve(texture))
        .catch(err => reject(err));
    };

    reader.onerror = () => {
      reject(`${ imageFile.name } was unable to load`);
    };
  });
};

export const prepareTextureFieldForSerialization = (
  field: StaticField<THREE.Texture | null>
) => {
  if(
    !field.value?.image ||
    !(field.value.image instanceof HTMLImageElement)
  ) return field;

  const data = field.value.image.src;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  field.value.userData = {
    ...field.value.userData,
    data,
    name: field.value.name
  };

  return { ...field };
};