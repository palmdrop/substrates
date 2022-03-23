import type { Rect, Stackable } from "./types/general";

export type Node<T> = {
  // Connections
  parent?: Node<T>;
  children: Node<T>[];

  // Data
  data?: T;

  // State
  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
}

export type NodeData = 'a' | 'b';

export type InterfaceNode = Rect & Stackable & Node<NodeData>;


