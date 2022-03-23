import type { Point } from "./general";
import type { InterfaceNode } from "./nodes";

// TODO: do I need all these event types? is it enough to have "NodeChange" events? then just provide kind of change, plus curr/prev nodes?
export type InterfaceEvents = {
  // View events
  'moveView': {
    offset: Point
  },
  'zoomView': {
    zoom: number,
    previousZoom: number,
  },

  // Node events
  'translateNodes': {
    previousPositions: Point[],
    nodes: InterfaceNode[],
  },
  'hoverNode': {
    node: InterfaceNode
    previous?: InterfaceNode
  },
  'activateNode': {
    node: InterfaceNode,
    previous?: InterfaceNode
  },
  'selectNodes': {
    nodes: InterfaceNode[],
    previous: InterfaceNode[]
  },
  'grabbedNodes': {
    nodes: InterfaceNode[],
  },
  'releasedNodes': {
    nodes: InterfaceNode[]
  }

  // Change events
  'viewChange': undefined,
  'nodeChange': undefined
}

export type InterfaceEventNames = keyof InterfaceEvents;