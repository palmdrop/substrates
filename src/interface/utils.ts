import type { Point, Rect, Program } from "./program/types";

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