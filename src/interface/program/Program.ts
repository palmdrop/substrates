import type { InterfaceNode } from "../types/nodes";
import type { Program } from "../types/program";

export const createDefaultProgram = (): Program => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    nodes: [
      {
        x: -200,  
        y: -150,
        width: 200,
        height: 100,
        children: [],
        layer: 0,
      },
      {
        x: 100,  
        y: 150,
        width: 100,
        height: 150,
        children: [],
        layer: 1,
      },
    ]
  }
}