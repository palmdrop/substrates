import type { InterfaceNode, Program } from "./types"

export const createDefaultProgram = (): Program => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    zoom: 1.0,
    nodes: [
      {
        x: 100,  
        y: 150,
        width: 200,
        height: 100,
        children: []
      },
      {
        x: 300,  
        y: 450,
        width: 100,
        height: 150,
        children: []
      },
    ]
  }
}