import { Point } from "./types/general";
import { Node, NodeField } from "./nodes";
import type { AnchorData, OpenConnection } from "./connections";

type Program<N extends Node = Node> = {
  position: Point;
  zoom: number;
  nodes: N[];

  openConnection?: OpenConnection
};
