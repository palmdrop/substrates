import { EDGE_PADDING, FONT_SIZE, MIN_NODE_HEIGHT, SPACING } from './constants';
import type { Point, Rect } from './types/general';
import type { Field, Node } from './types/nodes';
import type { Anchor } from './types/program/connections';
import type { Program } from './types/program/program';

export const projectPoint = (
  point: Point, 
  program: Program, 
  canvas: HTMLCanvasElement
): Point => {
  let x = program.position.x + point.x;
  let y = program.position.y + point.y;

  x /= program.zoom;
  y /= program.zoom;

  x += canvas.width / 2.0;
  y += canvas.height / 2.0;

  return { x, y };
};

export const unprojectPoint = (
  point: Point, 
  program: Program, 
  canvas: HTMLCanvasElement
): Point => {
  let x = point.x - canvas.width / 2.0;
  let y = point.y - canvas.height / 2.0;

  x *= program.zoom;
  y *= program.zoom;

  x -= program.position.x;
  y -= program.position.y;

  return { x, y };
};

export const isPointInRect = (
  point: Point,
  rect: Rect
): boolean => {
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&

    point.x <= (rect.x + rect.width) &&
    point.y <= (rect.y + rect.height)
  );
};

export const isPointInAnchor = (
  point: Point,
  anchor: Anchor,
  offset: Point
) => {
  const radius = anchor.size / 2.0;

  const vector = {
    x: point.x - (offset.x + anchor.x),
    y: point.y - (offset.y + anchor.y)
  };

  return (vector.x * vector.x + vector.y * vector.y) <= (radius * radius);
};

export const zoomAroundPoint = (
  deltaZoom: number, 
  point: Point,
  center: Point,
  program: Program
) => {
  // Update zoom
  program.zoom += deltaZoom;

  // Offset to make sure interface is scrolled towards the cursor
  const offsetX = (point.x - center.x) * deltaZoom;
  const offsetY = (point.y - center.y) * deltaZoom;

  program.position.x += offsetX;
  program.position.y += offsetY;
};

export const getRelativeMousePoisition = (
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
};

export const getNodeHeight = (numberOfFields: number) => {
  return Math.max(
    (
      EDGE_PADDING * 2.0 + 
      (SPACING + FONT_SIZE) * numberOfFields
    ),

    MIN_NODE_HEIGHT
  );
};

// TODO: figure out how to properly type this thing
type FieldActionMap = { [key in Field['kind']]: (field: Field)=> void }

export const executeFieldAction = (
  field: Field,
  actionMap: FieldActionMap
) => {
  switch(field.kind) {
    case 'static': actionMap.static(field); break;
    case 'dynamic': actionMap.dynamic(field); break;
    default: actionMap.static(field); // default to static
  }
};

// TODO: check other conditions as well?
export const canConnectAnchors = (
  anchor1: Anchor,
  node1: Node,
  anchor2: Anchor,
  node2: Node,
) => {
  return anchor1.type !== anchor2.type && node1 !== node2;
};