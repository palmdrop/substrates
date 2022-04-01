import type { DynamicField, Field } from "../types/nodes";
import type { Program } from "../types/program";
import { createRootNode, createSimplexNode, createSinNode, TypedNode } from "./nodes";
import { isNode, isTypedNode } from "./utils";

export const createDefaultProgram = (): Program<TypedNode> => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    nodes: [
      createSimplexNode(),
      createSinNode(),
      createRootNode(),
    ]
  };
}

export const canConnectNodes = (
  node: TypedNode,
  field: DynamicField,
  connectingNode: TypedNode,
): boolean => {
  if(
    node === connectingNode ||
    field.anchor.type === connectingNode.anchor.type
  ) return false;

  const visited = new Set<TypedNode>();
  visited.add(node);
  visited.add(connectingNode);

  const toVisit: TypedNode[] = [];
  const addChildNodesToVisit = (node: TypedNode) => {
    Object.values(node.fields).forEach(
      field => {
        if(isTypedNode(field.value)) {
          toVisit.push(field.value);
        }
      }
    );
  }

  addChildNodesToVisit(connectingNode);

  while(toVisit.length) {
    const current = toVisit.pop();

    if(visited.has(current)) return false;
    visited.add(current);

    addChildNodesToVisit(current);
  }

  return true;
}

export const connectNodes = (
  node: TypedNode,
  field: DynamicField,
  connectingNode: TypedNode,
) => {
  if(!canConnectNodes(node, field, connectingNode)) return false;
  field.value = connectingNode;

  return true;
}