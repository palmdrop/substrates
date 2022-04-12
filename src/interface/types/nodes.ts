import { GlslType } from '../../shader/types/core';
import type { Rect, Stackable } from './general';
import { Anchor } from './program/connections';

// FIELDS //
export type BaseField<T> = {
  kind: string,
  type: string,
  value: T,
  previousStaticValue?: T,
  min?: T,
  max?: T,
  anchor: Anchor, // TODO: each field should prob have an endpoint/anchor! even static once
}

export type DynamicField<T = number> = BaseField<T | Node> & {
  type: GlslType,
  kind: 'dynamic'
};

export type StaticField<T = number | boolean> = BaseField<T> & {
  type: GlslType,
  kind: 'static'
}

export type Field<T = number | boolean> = DynamicField<T> | StaticField<T>;

export type Fields = { [name: string]: Field };

export type FieldsInit = {
  [name: string]: DistributiveOmit<Field, 'anchor'>;
}

export type InitToFields<T> = T extends FieldsInit 
  ? {
    [K in keyof T]: T[K] & { 
      anchor: Anchor
    } 
  } 
  : never;


// NODE //
export type Node<
  T extends string = string, 
  F extends Fields = Fields
> = Rect & Stackable & {
  type: T,
  fields: F,
  anchor?: Anchor,
  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
  id: string;
}
