import { ANCHOR_SIZE, EDGE_PADDING, FONT_SIZE, NODE_WIDTH, SPACING } from '../constants';
import type { FieldsInit, InitToFields, Node } from '../types/nodes';
import { getNodeHeight } from '../utils';

// TODO: find solution without side effects  
let nodeCount = 0;

// Util object 
export const nodeKeys = [
  'root',
  'simplex',
  'sin'
] as const;

export type NodeKeys = typeof nodeKeys[number];

// TODO: just make all nodes "typed" nodes... no support for other nodes?
export const createNode = <
  T extends NodeKeys = NodeKeys, 
  F extends FieldsInit = FieldsInit
>(
  type: T,
  fieldsData: F,
  startX = 0,
  startY = 0,
): Node<T, InitToFields<F>> => {
  const layer = nodeCount++; 
  const width = NODE_WIDTH;

  const numberOfFields = Object.values(fieldsData).length;
  const height = getNodeHeight(numberOfFields);

  const fields: InitToFields<F> = (Object.entries(fieldsData) as [keyof F, F[string]][])
    .reduce((acc, [name, fieldInit], i) => {
      const minYOffset = (i * height / numberOfFields); 
      const y = 
        1.25 * EDGE_PADDING + 
        Math.max(
          (SPACING + FONT_SIZE) * i,
          minYOffset
        );

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

  /*
  fields.forEach(field => {
    executeFieldAction(
      field, {
        static: () => {},
        dynamic: field => {

        }
      }
    );
  })
  */
  
  const anchor = type !== 'root'
    ? {
      size: ANCHOR_SIZE,
      x: width,
      y: height / 2.0,
      type: 'node'
    } as const
    : undefined;

  return {
    type,
    x: startX,
    y: startY,
    width,
    height,
    anchor,
    layer,
    fields
  };
};

export const createSimplexNode = (
  startX = 0,
  startY = 0
) => {
  return createNode(
    'simplex',
    {
      'frequency': {
        type: 'dynamic',
        value: 1.0,
        min: 0.0,
        max: 10.0
      },
      'lacunarity': {
        type: 'dynamic',
        value: 2.0,
        min: 0.0,
        max: 10.0
      },
      'persistance': {
        type: 'dynamic',
        value: 0.5,
        min: 0.0,
        max: 1.0
      },
    },
    startX,
    startY
  );
};

export const createSinNode = (
  startX = 0,
  startY = 0
) => {
  const fields = 
    {
      'frequency': {
        type: 'dynamic',
        value: 1.0,
        min: 0.0,
        max: 100.0
      },
      'amplitude': {
        type: 'dynamic',
        value: 1.0,
        min: 0.0,
        max: 10
      },
      'normalize': {
        type: 'static',
        value: false
      }
    } as const;

  return createNode<'sin', typeof fields>(
    'sin',
    fields,
    startX,
    startY
  );
};

export const createRootNode = (
  startX = 0,
  startY = 0
) => {
  return createNode(
    'root',
    {
      'source': {
        type: 'dynamic',
        value: 0.0
      },
      'dithering': {
        type: 'dynamic',
        value: 0.0
      },
    },
    startX,
    startY
  );
};

type NodeTypeEntry<T extends ()=> Node> = {
  [key in ReturnType<T>['type']]: ReturnType<T>
}

export type NodeTypes = 
  NodeTypeEntry<typeof createSimplexNode> &
  NodeTypeEntry<typeof createRootNode> &
  NodeTypeEntry<typeof createSinNode>;

export type ShaderNode = NodeTypes[NodeKeys];