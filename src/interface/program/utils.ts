/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Node } from '../types/nodes';
import { nodeKeys, ShaderNode } from './nodes';

export const isNode = (node: any): node is Node => {
  return (
    typeof node === 'object' &&
    typeof node.type === 'string' &&
    typeof node.fields === 'object'
  );
};

export const isTypedNode = (node: any): node is ShaderNode => {
  return (
    isNode(node) &&
    Object.prototype.hasOwnProperty.call(nodeKeys, node.type)
  );
};