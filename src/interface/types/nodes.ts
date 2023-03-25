import { GlslRootType, GlslType, GlslVariable } from '../../shader/types/core';
import { DistributiveOmit } from '../../types/utils';
import type { Rect, Stackable } from './general';
import { Anchor } from './program/connections';

// FIELDS //
export type BaseField<T, GT extends GlslType = GlslType> = {
  kind: string,
  type: GT,

  value: T,
  defaultValue?: T,
  previousStaticValue?: T,
  min?: T,
  max?: T,
  restricted?: boolean

  anchor: Anchor,

  internal?: boolean,
  internalOptional?: boolean,
  inputLocked?: boolean,
  excludeFromFunction?: boolean,
  hidden?: boolean,
  updateUniform?: boolean,
  external?: boolean
}

export type DynamicField<T = number, GT extends GlslType = GlslType> = BaseField<
  (
    GT extends `${GlslRootType}[]` 
    ? T[] | Node[]
    : T | Node
  ),
  GT
> & {
  kind: 'dynamic'
};

export type StaticField<T = number | boolean> = BaseField<T> & {
  kind: 'static'
}

export type ChoiceField<T = number> = BaseField<T> & {
  kind: 'choice',
  choices: {
    [label: string]: T
  }
}

export type Field<T = GlslVariable['value']> 
  = DynamicField<T> 
  | StaticField<T>
  | ChoiceField<T>;

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
  name?: string,
  fields: F,
  anchor?: Anchor,

  hovered?: boolean,
  active?: boolean,
  elevated?: boolean, // True when a node is grabbed, for example

  returnType: GlslType,
  id: string;
}

// EFFECTS //
export type Effect = <T extends Node = Node>(field: Field, node: T) => void;

export type NodeEffects = {
  [nodeName: string]: {
    [filedName: string]: Effect
  }
}