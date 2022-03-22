type Point = {
  x: number,
  y: number
};

export type Stackable = {
  layer?: number;
}

export type Rect = Point & {
  width: number;
  height: number;
}

export type Node<T> = {
  parent?: Node<T>;
  children: Node<T>[];
  data?: T;

  hovered?: boolean;
  active?: boolean;
  elevated?: boolean; // True when a node is grabbed, for example
}

export type NodeData = 'a' | 'b';

export type InterfaceNode = Rect & Stackable & Node<NodeData>;

export type Program = {
  position: Point,
  zoom: number,
  nodes: InterfaceNode[];
}
