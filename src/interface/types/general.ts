export type Point = {
  x: number,
  y: number
};

export type Stackable = {
  layer: number;
}

export type Rect = Point & {
  width: number;
  height: number;
}
