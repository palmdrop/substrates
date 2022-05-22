import { nodeConfigs } from '../../shader/builder/nodes';
import { NodeConfig } from '../../shader/types/programBuilder';
import { UnionToIntersection } from '../../types/utils';
import { ANCHOR_SIZE, EDGE_PADDING, FONT_SIZE, NODE_EXTRA_SPACES, NODE_WIDTH, SPACING } from '../constants';
import type { FieldsInit, InitToFields, Node } from '../types/nodes';
import { getNodeHeight } from '../utils';

// TODO: find solution without side effects  
let nodeCount = 0;

// Util object 
export const nodeKeys = Object.values(nodeConfigs).map(config => config.name);

export type NodeKey = typeof nodeKeys[number];

export const createNode = <
  T extends NodeKey = NodeKey, 
  F extends FieldsInit = FieldsInit
>(
  nodeConfig: NodeConfig<T, F>,
  startX = 0,
  startY = 0,
): Node<T, InitToFields<F>> => {
  const type = nodeConfig.name;
  const fieldsData = nodeConfig.fields;
  const returnType = nodeConfig.returnType;

  const layer = nodeCount++; // TODO fix side effect
  const width = NODE_WIDTH;

  const numberOfVisibleFields = Object.values(fieldsData)
    .filter(fieldData => !fieldData.internal)
    .length;

  const height = getNodeHeight(numberOfVisibleFields);

  let i = NODE_EXTRA_SPACES;
  const fields: InitToFields<F> = (Object.entries(fieldsData) as [keyof F, F[string]][])
    .reduce((acc, [name, fieldInit]) => {
      const minYOffset = (i * height / (numberOfVisibleFields + NODE_EXTRA_SPACES)); 

      let y = 0.0;
      if(!fieldInit.internal) {
        y = 
          1.25 * EDGE_PADDING + 
          Math.max(
            (SPACING + FONT_SIZE) * i,
            minYOffset
          );

        i++;
      }

      const field = {
        ...fieldInit,
        anchor: {
          size: ANCHOR_SIZE,
          x: 0.0,
          y: y - ANCHOR_SIZE / 4.0,
          type: 'field'
        }
      } as InitToFields<F>[string]; // TODO why is this necessary?

      acc[name] = field;

      return acc;
    }, {} as InitToFields<F>);

  const anchor = type !== 'root'
    ? {
      size: ANCHOR_SIZE,
      x: width,
      y: height / 2.0,
      type: 'node'
    } as const
    : undefined;

  // TODO add returnType to node type! use later to determine if anchors can connect! (diff glsltype nodes should not be able to connect!!!)
  return {
    type,
    x: startX,
    y: startY,
    width,
    height,
    anchor,
    layer,
    fields,
    returnType,
    id: '' + nodeCount
  };
};

const buildNodeCreator = (nodeConfig: NodeConfig) => (
  startX = 0,
  startY = 0
) => {
  return createNode(
    nodeConfig as NodeConfig<NodeKey>,
    startX,
    startY
  );
};

const shaderNodeCreators = Object.values(nodeConfigs).map(buildNodeCreator);

export type ShaderNode = ReturnType<typeof shaderNodeCreators[number]>;

type NodeTypeEntry<T extends Node> = 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends any ? {
    [key in T['type']]: T
  }: never;

export type NodeTypes = UnionToIntersection<NodeTypeEntry<ShaderNode>>;

export const nodeCreatorMap = shaderNodeCreators.reduce((acc, nodeFunction) => {
  acc[nodeFunction().type] = nodeFunction;
  return acc;
}, {} as { [key in NodeKey]: (startX: number, startY: number) => ShaderNode });
