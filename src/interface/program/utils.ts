import type { Node } from "../types/nodes";
import { nodeKeys, TypedNode } from "./nodes";

export const isNode = (node: any): node is Node => {
  return (
    typeof node === 'object' &&
    typeof node.type === 'string' &&
    typeof node.fields === 'object'
  );
}

export const isTypedNode = (node: any): node is TypedNode => {
  return (
    isNode(node) &&
    nodeKeys[node.type] !== undefined
  );
}