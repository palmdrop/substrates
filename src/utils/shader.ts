export const setUniform = <T>( 
  name: string,
  value?: T,

  destinationObject?: { 
    uniforms?: { 
      [uniform: string]: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any
      }
    } | undefined
  }
) => {
  if( 
    !destinationObject || 
    !destinationObject.uniforms ||
    !destinationObject.uniforms[name]
  ) return undefined;

  if(value) destinationObject.uniforms[name].value = value;
  return destinationObject.uniforms[name].value as T;
}; 