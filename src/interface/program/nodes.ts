import { ANCHOR_SIZE, EDGE_PADDING, FONT_SIZE, NODE_WIDTH, SPACING } from '../constants';
import type { Anchor } from '../types/connections';
import type { FieldsInit, InitToFields, Node } from '../types/nodes';
import { getNodeHeight } from '../utils';

// TODO: find solution without side effects  
let nodeCount = 0;

export const createNode = <
  T extends string, 
  F extends FieldsInit
>(
  type: T,
  fieldsData: F,
  startX: number = 0,
  startY: number = 0,
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
    }
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
}

// Util object 
export const nodeKeys = {
  root: "root",
  simplex: "simplex",
  sin: "sin",
} as const;

export const createSimplexNode = (
  startX: number = 0,
  startY: number = 0
) => {
  return createNode(
    nodeKeys.simplex,
    {
      "frequency": {
        type: "dynamic",
        value: 1.0
      },
      "lacunarity": {
        type: "dynamic",
        value: 2.0
      },
      "persistance": {
        type: "dynamic",
        value: 0.5
      },
    },
    startX,
    startY
  );
}

export const createSinNode = (
  startX: number = 0,
  startY: number = 0
) => {
  return createNode(
    nodeKeys.sin,
    {
      "frequency": {
        type: "dynamic",
        value: 1.0
      },
      "amplitude": {
        type: "dynamic",
        value: 1.0
      },
      "normalize": {
        type: "static",
        value: false
      }
    },
    startX,
    startY
  );
}

export const createRootNode = (
  startX: number = 0,
  startY: number = 0
) => {
  return createNode(
    nodeKeys.root,
    {
      "mainSource": {
        type: "dynamic",
        value: 0.0
      },
      "dithering": {
        type: "dynamic",
        value: 0.0
      },
    },
    startX,
    startY
  );
}

type NodeTypeEntry<T extends () => Node> = {
  [key in ReturnType<T>['type']]: ReturnType<T>
}

export type NodeTypes = 
  NodeTypeEntry<typeof createSimplexNode> &
  NodeTypeEntry<typeof createRootNode> &
  NodeTypeEntry<typeof createSinNode>;

export type TypedNode = NodeTypes[keyof typeof nodeKeys];
