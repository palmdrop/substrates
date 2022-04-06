import { Anchor } from './program/connections';
import type { Rect, Stackable } from './general';

// FIELDS //
export type BaseField<T> = {
  // name: string
  type: string,
  value: T,
  min?: T,
  max?: T,
  anchor: Anchor, // TODO: each field should prob have an endpoint/anchor! even static once
}

export type DynamicField<T = number | boolean> = BaseField<T | Node> & {
  type: 'dynamic'
};

export type StaticField<T = number | boolean> = BaseField<T> & {
  type: 'static'
}

export type Field<T = number | boolean> = DynamicField<T> | StaticField<T>;

export type Fields = { [name: string]: Field };

export type FieldsInit = {
  [name: string]: DistributiveOmit<Field, 'anchor'>;
}

export type InitToFields<T> = T extends FieldsInit 
  ? {
    [K in keyof T]: T[K] & { anchor: Anchor }
  } 
  : never;


// NODE //
export type Node<
  T extends string = string, 
  F extends Fields = Fields
> = Rect & Stackable & {
  type: T,

  // Fields
  fields: F,

  // Anchor
  anchor?: Anchor,

  // State
  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
}
