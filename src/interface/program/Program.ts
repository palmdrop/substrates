import { NODE_WIDTH } from "../constants";
import type { InterfaceNode, NodeField } from "../types/nodes";
import type { Program } from "../types/program";
import { getNodeHeight } from "../utils";

// TODO: find solution without side effects  
let nodeCount = 0;

export const createNode = (
  type: string,
  fields: NodeField[],
  canvas: HTMLCanvasElement,
  startX?: number,
  startY?: number
): InterfaceNode => {
  const layer = nodeCount++; 

  const width = NODE_WIDTH;
  const height = getNodeHeight(fields.length);

  const x = startX ?? canvas.width / 2.0 - width / 2.0;
  const y = startY ?? canvas.height / 2.0 - height / 2.0;

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
            name: "Frequency",
            value: 1.0
          },
          {
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
            name: "Frequency",
            value: 2.0
          },
          {
            name: "Amplitude",
            value: 0.5
          },
          {
            name: "Lacunarity",
            value: 2.5
          },
          {
            name: "Lacunarity",
            value: 2.5
          },
          {
            name: "Lacunarity",
            value: 2.5
          },
          {
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