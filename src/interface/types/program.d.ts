import { Point } from "./types/general";
import { InterfaceNode } from "./nodes";

type Program = {
  position: Point;
  zoom: number;
  nodes: InterfaceNode[];
};
