import { getRootType, isArrayType, isNodePartOfCycle } from '../../shader/builder/utils/general';
import { arrayContentsEqual } from '../../utils/general';
import { SelectionManager } from '../controller/SelectionManager';
import type { DynamicField, Node } from '../types/nodes';
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
  if(getRootType(field.type) !== connectingNode.returnType) return false;

  const fieldIsArrayType = isArrayType(field);

  if(!fieldIsArrayType && !isNode(field.value)) {
    field.previousStaticValue = field.value;
  }

  if(isArrayType(field)) {
    const value = field.value as Node[];
    if(value.includes(connectingNode)) return false;

    if(field.defaultValue && arrayContentsEqual(field.value as unknown[], field.defaultValue as unknown[])) {
      field.value = [connectingNode];
    } else {
      (field.value as Node[]).push(connectingNode);
    }
  } else {
    field.value = connectingNode;
  }

  console.log(field.value);

  if(!isNodePartOfCycle(node)) return true;

  // If node is now part of cycle, revert
  disconnectField(field, connectingNode);

  return false;
};

export const disconnectField = (
  field: DynamicField,
  node?: Node
) => {
  const fieldIsArrayType = isArrayType(field);
  if(!fieldIsArrayType && !isNode(field.value)) return false;

  const setToDefaultArray = () => {
    (field.value as unknown[]) = [...field.defaultValue as unknown[]] ?? []; 
  }

  if(fieldIsArrayType && node) {
    field.value = (field.value as Node[]).filter(connectNode => connectNode !== node);
    if(!field.value.length) setToDefaultArray();
  } else if(fieldIsArrayType) {
    setToDefaultArray();
  } else if(typeof field.previousStaticValue !== 'undefined') {
    field.value = field.previousStaticValue;
  } else if(typeof field.min === 'number' && typeof field.max === 'number') {
    field.value = (field.max + field.min) / 2.0;
  } else {
    // NOTE TODO: will this always work? what about nodes of other types?
    field.value = 0.0;
  }

  console.log(field.value);

  return true;
};

export const disconnectNodeOutput = (
  node: ShaderNode,
  selectionManager: SelectionManager
) => {
  const childConnections = selectionManager.getChildConnections(
    node
  );

  childConnections.forEach(({ field }) => disconnectField(field as DynamicField, node));

  return childConnections;
};