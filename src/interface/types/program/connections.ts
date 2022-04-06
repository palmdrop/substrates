import { ShaderNode } from '../../program/nodes';
import { Point } from '../general';
import { DynamicField, Field } from '../nodes';

export type Anchor = Point & {
  size: number,
  hovered?: boolean,
  active?: boolean,
  type: 'field' | 'node'
}

export type Connection = {
  node: ShaderNode,
  field: Field
};

export type AnchorData = {
  anchor: Anchor,
  node: ShaderNode,
  field?: DynamicField,
};

export type OpenConnection = AnchorData & {
  point: Point,
};
