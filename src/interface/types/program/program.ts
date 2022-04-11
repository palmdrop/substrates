import type { OpenConnection } from './connections';
import type { Point } from '../general';
import { ShaderNode } from '../../program/nodes';

export type Program = {
  position: Point;
  zoom: number;
  nodes: ShaderNode[];
  rootNode: ShaderNode,

  openConnection?: OpenConnection
};
