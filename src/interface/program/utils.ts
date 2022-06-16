/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Field, Fields, Node } from '../types/nodes';
import { nodeCounter, nodeKeys,ShaderNode } from './nodes';

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

export const duplicateNode = (node: ShaderNode): ShaderNode => {
  const duplicate = {
    ...node,
    anchor: node.anchor ? {
      ...node.anchor
    } : undefined,
    id: '' + nodeCounter.next(),
    fields: (Object.entries(node.fields) as [string, Field][]).reduce((acc, [name, field]) => {
      acc[name] = {
        ...field,
        anchor: {
          ...field.anchor
        }
      };
      return acc;
    }, {} as Fields)
  };

  return duplicate;
};