import type { DynamicField, Field } from '../types/nodes';
import type { Program } from '../types/program/program';
import { createRootNode, createSimplexNode, createSinNode, ShaderNode } from './nodes';
import { isShaderNode } from './utils';

export const createDefaultProgram = (): Program => {
  const rootNode = createRootNode();
  return {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    rootNode,
    nodes: [
      rootNode,
      createSimplexNode(),
      createSinNode(),
    ]
  };
};

export const canConnectNodes = (
  node: ShaderNode,
  field: DynamicField,
  connectingNode: ShaderNode,
): boolean => {
  if(
    node === connectingNode ||
    field.anchor.type === connectingNode.anchor?.type
  ) return false;

  const visited = new Set<ShaderNode>();
  visited.add(node);
  visited.add(connectingNode);

  const toVisit: ShaderNode[] = [];
  const addChildNodesToVisit = (node: ShaderNode) => {
    Object.values(node.fields).forEach(
      (field: Field) => {
        if(isShaderNode(field.value)) {
          toVisit.push(field.value);
        }
      }
    );
  };

  addChildNodesToVisit(connectingNode);

  while(toVisit.length) {
    const current = toVisit.pop() as ShaderNode;

    if(visited.has(current)) return false;
    visited.add(current);

    addChildNodesToVisit(current);
  }

  return true;
};

export const connectNodes = (
  node: ShaderNode,
  field: DynamicField,
  connectingNode: ShaderNode,
) => {
  if(!canConnectNodes(node, field, connectingNode)) return false;
  field.value = connectingNode;

  return true;
};