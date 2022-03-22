import type { Point, Program } from "../program/types";

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