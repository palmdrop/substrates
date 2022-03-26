import { Point } from "./types/general";
import { InterfaceNode, NodeField } from "./nodes";
import type { AnchorData } from "./connections";

type OpenConnection = AnchorData & {
  point: Point,
};

type Program = {
  position: Point;
  zoom: number;
  nodes: InterfaceNode[];

  openConnection?: OpenConnection
};
