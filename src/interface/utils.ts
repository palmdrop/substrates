import { iterateDepthFirst } from '../shader/builder/utils/general';
import { EDGE_PADDING, FONT_SIZE, MIN_NODE_HEIGHT, SPACING } from './constants';
import type { Point, Rect } from './types/general';
import type { Node } from './types/nodes';
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

export const getTransformedRect = (rect: Rect, program: Program, canvas: HTMLCanvasElement): Rect => {
  const point = projectPoint(rect, program, canvas);

  return {
    ...point, 
    width: rect.width / program.zoom, 
    height: rect.height / program.zoom
  };
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

export const getProgramBoundingBox = (
  program: Program
) => {
  const min = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  };

  const max = {
    x: Number.NEGATIVE_INFINITY,
    y: Number.NEGATIVE_INFINITY
  };

  program.nodes.forEach(node => {
    min.x = Math.min(node.x, min.x);
    min.y = Math.min(node.y, min.y);

    max.x = Math.max(node.x + node.width, max.x);
    max.y = Math.max(node.y + node.height, max.y);
  });

  return {
    min, max
  };
};

export const centerProgram = (
  program: Program
) => {
  const { min, max } = getProgramBoundingBox(program);

  const programCenter = {
    x: (max.x + min.x) / (2.0),
    y: (max.y + min.y) / (2.0)
  };

  if(
    program.position.x === -programCenter.x && 
    program.position.y === -programCenter.y
  ) {
    return false;
  }

  program.position.x = -programCenter.x;
  program.position.y = -programCenter.y;

  return true;
};

export const fitProgram = (
  program: Program,
  canvas: HTMLCanvasElement
) => {
  // TODO: move to constants?
  const xMargins = 0.05; // 5%
  const yMargins = 0.10; // 10%

  const { min, max } = getProgramBoundingBox(program);
  const interfaceWidth = canvas.width;
  const interfaceHeight = canvas.height;

  const programWidth = max.x - min.x;
  const programHeight = max.y - min.y;

  const requiredZoom = Math.max(
    1.0, 
    2.0 * xMargins + programWidth / interfaceWidth,
    2.0 * yMargins + programHeight / interfaceHeight
  );

  const zoomed = requiredZoom !== program.zoom;

  program.zoom = requiredZoom;
  const moved = centerProgram(program);

  return {
    zoomed,
    moved
  };
};

export const getRelativeMousePosition = (
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
};

export const getNodeHeight = (numberOfVisibleFields: number) => {
  return Math.max(
    (
      EDGE_PADDING * 2.0 + 
      (SPACING + FONT_SIZE) * numberOfVisibleFields
    ),

    MIN_NODE_HEIGHT
  );
};

// TODO: check other conditions as well?
export const canConnectAnchors = (
  anchor1: Anchor,
  node1: Node,
  anchor2: Anchor,
  node2: Node,
) => {
  return (
    anchor1.type !== anchor2.type && 
    node1 !== node2
  );
};

export const isPartOfMainGraph = (
  node: Node,
  program: Program
) => {
  let found = false;

  iterateDepthFirst(program.rootNode, current => {
    if(current === node) found = true;
  });

  return found;
};