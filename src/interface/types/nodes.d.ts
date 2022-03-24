import type { Rect, Stackable } from "./general";

type Field<T> = {
  name: string
  value: T
}

type DynamicField<T = number> = Field<T | Node<T>>;
type StaticField<T = number> = Field<T>;

type NodeField = DynamicField | StaticField;

// TODO: T is unused
type Node<T = number> = {
  type: string,

  // Fields
  fields: NodeField[];

  // State
  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
}

export type InterfaceNode = Rect & Stackable & Node;


