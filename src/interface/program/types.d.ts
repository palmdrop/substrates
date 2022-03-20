type Position = {
  x: number,
  y: number
};

// 
export type Stackable = {
  layer?: number;
}

export type Positionable = Position & {
  width: number;
  height: number;
}

export type Node<T> = {
  parent?: Node<T>;
  children: Node<T>[];
  data?: T;
}

export type NodeData = 'a' | 'b';

export type InterfaceNode = Positionable & Stackable & Node<NodeData>;

export type Program = {
  position: Position,
  zoom: number,
  nodes: InterfaceNode[];
}
