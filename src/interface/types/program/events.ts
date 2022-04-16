import type { Point } from '../general';
import type { Field, Node } from '../nodes';
import type { AnchorData, Connection, OpenConnection } from './connections';

// TODO: do I need all these event types? is it enough to have "NodeChange" events? then just provide kind of change, plus curr/prev nodes?
export type Events = {
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
    nodes: Node[],
  },
  'hoverNode': {
    node: Node
    previous?: Node
  },
  'activateNode': {
    node: Node,
    previous?: Node
  },
  'deactivateNode': {
    node: Node,
  },
  'selectNodes': {
    nodes: Node[],
    previous: Node[]
  },
  'grabbedNodes': {
    nodes: Node[],
  },
  'releasedNodes': {
    nodes: Node[]
  }

  // Anchor events
  'hoveredNodeAnchor': AnchorData,
  'activateNodeAnchor': AnchorData,
  'releaseNodeAnchor': AnchorData,

  // Connections
  'connectNodes': { node: Node, field: Field, source: Node },
  'disconnectNodes': { node: Node, connections: Connection[] },
  'moveOpenNodeConnection': OpenConnection,
  'dropOpenNodeConnection': OpenConnection,

  // Add/delete
  'addNodes': { nodes: Node[] },
  'deleteNodes': { nodes: Node[], needsRecompile?: boolean },

  // Unplaced
  'addUnplacedNode': { node: Node },
  'moveUnplacedNode': { node: Node },
  'cancelUnplacedNode': { node: Node },

  // Reset
  'nodeViewReset': undefined,

  // Change events
  'programChange': undefined,
  'viewChange': undefined,
  'nodeChange': undefined
}

export type EventName = keyof Events;
