import type { DynamicField, Field } from '../types/nodes';
import type { Program } from '../types/program/program';
import { createRootNode, createSimplexNode, ShaderNode } from './nodes';
import { isNode, isShaderNode } from './utils';

export const createDefaultProgram = (): Program => {
  const rootNode = createRootNode(400, 0);
  const simplexNode1 = createSimplexNode(0, 0);
  const simplexNode2 = createSimplexNode(-400, 0);

  simplexNode2.fields.exponent.value = 4.0;

  // TODO Fix FieldToInit type to avoid this ugly workaround... 
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (rootNode.fields.source as any).value = simplexNode1;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (simplexNode1.fields.frequency as any).value = simplexNode2;

  return {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    rootNode,
    nodes: [
      rootNode,
      simplexNode1,
      simplexNode2
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
  field.previousStaticValue = field.value;
  field.value = connectingNode;

  return true;
};

export const disconnectField = (
  field: DynamicField
) => {
  if(!isNode(field.value)) return false;

  if(typeof field.previousStaticValue !== 'undefined') {
    field.value = field.previousStaticValue;
  } else if(typeof field.min === 'number' && typeof field.max === 'number') {
    field.value = (field.max + field.min) / 2.0;
  } else {
    // NOTE TODO: will this always work? what about nodes of other types?
    field.value = 0.0;
  }

  return true;
};