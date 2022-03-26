import { ANCHOR_SIZE, EDGE_PADDING, FONT_SIZE, NODE_WIDTH, SPACING } from "../constants";
import type { FieldInit, InterfaceNode, NodeField } from "../types/nodes";
import type { Program } from "../types/program";
import { executeFieldAction, getNodeHeight } from "../utils";

// TODO: find solution without side effects  
let nodeCount = 0;

export const createNode = (
  type: string,
  fieldsData: FieldInit[],
  canvas: HTMLCanvasElement,
  startX?: number,
  startY?: number
): InterfaceNode => {
  const layer = nodeCount++; 
  const width = NODE_WIDTH;

  const height = getNodeHeight(fieldsData.length);

  const fields: NodeField[] = fieldsData.map((fieldData, i) => {
    const minYOffset = (i * height / fieldsData.length); 
    const y = 
      (1.25 * EDGE_PADDING) + 
      Math.max(
        ((SPACING + FONT_SIZE) * i),
        minYOffset
      );

    return {
      ...fieldData,
      anchor: {
        size: ANCHOR_SIZE,
        x: 0.0,
        y: y - ANCHOR_SIZE / 4.0
      }
    }
  })

  const x = startX ?? canvas.width / 2.0 - width / 2.0;
  const y = startY ?? canvas.height / 2.0 - height / 2.0;

  fields.forEach(field => {
    executeFieldAction(
      field, {
        static: () => {},
        dynamic: field => {

        }
      }
    );
  })

  return {
    type,
    x,
    y,
    width,
    height,
    layer,
    fields
  };
}

// TODO: calculate node width/height from fields!
export const createDefaultProgram = (canvas: HTMLCanvasElement): Program => {
  const program: Program = {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    nodes: [
      createNode(
        "noise",
        [
          {
            type: 'dynamic',
            name: "Frequency",
            value: 1.0
          },
          {
            type: 'dynamic',
            name: "Amplitude",
            value: 1.0
          }
        ],
        canvas,
        -150,
        -100
      ),
      createNode(
        "trig",
        [
          {
            type: 'dynamic',
            name: "Frequency",
            value: 2.0
          },
          {
            type: 'dynamic',
            name: "Amplitude",
            value: 0.5
          },
          {
            type: 'static',
            name: "Lacunarity",
            value: 2.5
          },
          {
            type: 'dynamic',
            name: "Lacunarity",
            value: 2.5
          },
          {
            type: 'dynamic',
            name: "Lacunarity",
            value: 2.5
          },
          {
            type: 'static',
            name: "Lacunarity",
            value: 2.5
          }
        ],
        canvas,
        100,  
        150,
      )
    ]
  };

  return program;
}