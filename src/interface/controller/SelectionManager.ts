import type { InterfaceNode, Point, Program } from "../program/types";
import { projectPoint, isPointInRect, unprojectPoint } from "../utils";

export class SelectionManager {
  constructor(
    private canvas: HTMLCanvasElement,
    private program: Program
  ) {

    // TODO use grid or quad tree to optimize selections
    // Give an "update" method that is called when nodes are moved (only when released!)
  }

  getNodeUnderPoint(point: Point): (InterfaceNode | null) {
    const transformedPoint = unprojectPoint(
      point, this.program, this.canvas
    );

    const node = this.program.nodes.reduce(
      (contender, node) => {
        if(isPointInRect(transformedPoint, node)) {
          if(!contender) return node;

          return (
            (contender.layer ?? 0) > (node.layer ?? 0) || !node.elevated
            ? contender
            : node
          );
        }
        
        return contender;
      }, 
      undefined as (undefined | InterfaceNode)
    )

    return node ? node : null;
  }
}