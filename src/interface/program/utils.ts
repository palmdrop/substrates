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

export const isShaderNode = (node: any): node is ShaderNode => {
  return (
    isNode(node) &&
    Array.prototype.includes.call(nodeKeys, node.type) // NOTE: to avoid typing issues...
  );
};