import { Node } from './nodes';

type Anchor = Point & {
  size: number,
  hovered?: boolean,
  active?: boolean,
  type: 'field' | 'node'
}

type Connection = {
  node: Node,
  field: NodeField
};

export type AnchorData = {
  anchor: Anchor,
  node: InterfaceNode
  field?: NodeField,
};

type OpenConnection = AnchorData & {
  point: Point,
};
