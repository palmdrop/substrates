import { detectCycle, isNodePartOfCycle } from '../../shader/builder/utils/general';
import type { DynamicField, Field } from '../types/nodes';
import type { Program } from '../types/program/program';
import { nodeCreatorMap, ShaderNode } from './nodes';
import { isNode, isShaderNode } from './utils';


export const createDefaultProgram = (): Program => {
  const rootNode = nodeCreatorMap['root'](400, 0);
  const simplexNode1 = nodeCreatorMap['simplex'](0, 0);
  const simplexNode2 = nodeCreatorMap['simplex'](-400, 0);

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

export const connectNodes = (
  node: ShaderNode,
  field: DynamicField,
  connectingNode: ShaderNode,
) => {
  field.previousStaticValue = field.value;
  field.value = connectingNode;

  if(!isNodePartOfCycle(node)) return true;

  // If node is now part of cycle, revert
  disconnectField(field);

  return false;
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