import { ShaderNode } from '../../program/nodes';
import type { Point } from '../general';
import type { OpenConnection } from './connections';

export type Program = {
  position: Point;
  zoom: number;
  nodes: ShaderNode[];
  rootNode: ShaderNode,

  openConnection?: OpenConnection
};
