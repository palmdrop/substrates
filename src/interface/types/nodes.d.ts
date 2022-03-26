import type { Point, Rect, Stackable } from "./general";

// ANCHORS //
type Anchor = Point & {
  size: number,
  hovered?: boolean,
  active?: boolean
}

// FIELDS //
type Field<T> = {
  name: string
  type: string,
  value: T,
  anchor: Anchor // TODO: each field should prob have an endpoint/anchor! even static once
}

type DynamicField = Field<number | Node> & {
  type: 'dynamic'
};

type StaticField = Field<number> & {
  type: 'static'
}

type NodeField = DynamicField | StaticField;

type FieldInit = DistributiveOmit<NodeField, 'anchor'>;


// NODE //
// TODO: T is unused
type Node = {
  type: string,

  // Fields
  fields: NodeField[];

  // State
  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
}

export type InterfaceNode = Rect & Stackable & Node;


