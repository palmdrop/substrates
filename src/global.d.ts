/// <reference types="svelte" />

declare module '*.scss';
declare module '*.png' {
  const value: string;
  export = value;
}