import { EDGE_PADDING, FONT_SIZE, MIN_NODE_HEIGHT, SPACING } from "./constants";
import type { Point, Rect } from "./types/general";
import type { InterfaceNode } from "./types/nodes";
import type { Program } from "./types/program";

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
}

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
}

export const isPointInRect = (
  point: Point,
  rect: Rect
): boolean => {
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&

    point.x <= (rect.x + rect.width) &&
    point.y <= (rect.y + rect.height)
  )
}

export const zoomAroundPoint = (
  deltaZoom: number, 
  point: Point,
  center: Point,
  program: Program
) => {
  // Update zoom
  program.zoom += deltaZoom;

  // Offset to make sure interface is scrolled towards the cursor
  let offsetX = (point.x - center.x) * deltaZoom;
  let offsetY = (point.y - center.y) * deltaZoom;

  program.position.x += offsetX;
  program.position.y += offsetY;
}

export const getRelativeMousePoisition = (
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
}

export const getNodeHeight = (numberOfFields: number) => {
  return Math.max(
    (
      EDGE_PADDING * 2.0 + 
      (SPACING + FONT_SIZE) * numberOfFields
    ),

    MIN_NODE_HEIGHT
  )
}