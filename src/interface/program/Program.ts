import { isNodePartOfCycle } from '../../shader/builder/utils/general';
import { SelectionManager } from '../controller/SelectionManager';
import type { DynamicField } from '../types/nodes';
import type { Program } from '../types/program/program';
import { nodeCreatorMap, ShaderNode } from './nodes';
import { isNode } from './utils';

export const createDefaultProgram = (): Program => {
  const rootNode = nodeCreatorMap['root'](500, 0);
  const hsvToRgb = nodeCreatorMap['hsvToRgb'](225, 0);
  const simplexNode1 = nodeCreatorMap['simplex'](-80, 0);
  const simplexNode2 = nodeCreatorMap['simplex'](-400, 0);

  simplexNode2.fields.exponent.value = 4.0;

  // TODO Fix FieldToInit type to avoid this ugly workaround... 
  rootNode.fields.color.previousStaticValue = rootNode.fields.color.value;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (rootNode.fields.color as any).value = hsvToRgb;

  hsvToRgb.fields.value.previousStaticValue = 0.5;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (hsvToRgb.fields.value as any).value = simplexNode1;

  simplexNode1.fields.frequency.previousStaticValue = 1.0;
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
      hsvToRgb,
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
  if(field.type !== connectingNode.returnType) return false;

  if(!isNode(field.value)) {
    field.previousStaticValue = field.value;
  }

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

export const disconnectNodeOutPut = (
  node: ShaderNode,
  selectionManager: SelectionManager
) => {
  const childConnections = selectionManager.getChildConnections(
    node
  );

  childConnections.forEach(({ field }) => disconnectField(field as DynamicField));

  return childConnections;
};