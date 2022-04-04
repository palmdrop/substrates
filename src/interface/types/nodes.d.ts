import type { Point, Rect, Stackable } from "./general";

// FIELDS //
type BaseField<T> = {
  // name: string
  type: string,
  value: T,
  min?: T,
  max?: T,
  anchor: Anchor, // TODO: each field should prob have an endpoint/anchor! even static once
}

type DynamicField = BaseField<number | Node> & {
  type: 'dynamic'
};

type StaticField<T = number> = BaseField<T> & {
  type: 'static'
}

type Field<T = number> = DynamicField<T> | StaticField<T>;

type Fields = { [name: string]: Field };

type FieldsInit = {
  [name: string]: DistributiveOmit<Field, 'anchor'>;
}

type InitToFields<T> = T extends FieldsInit 
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


