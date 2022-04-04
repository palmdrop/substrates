import type { AnchorData, Connection } from "../types/connections";
import type { Point } from "../types/general";
import type { Node, Field } from "../types/nodes";
import type { Program } from "../types/program";
import { isPointInAnchor, isPointInRect, unprojectPoint } from "../utils";

type NodeFind 
  = Node 
  | undefined;

type AnchorFind 
  = AnchorData
  | undefined;

export class SelectionManager {
  constructor(
    private canvas: HTMLCanvasElement,
    private program: Program
  ) {

    // TODO use grid or quad tree to optimize selections
    // Give an "update" method that is called when nodes are moved (only when released!)
  }

  // TODO: optimize
  getChildConnections(parentNode: Node) {
    const childConnections: Connection[] = [];

    this.program.nodes.forEach(node => {
      if(node === parentNode) return;

      Object.values(node.fields).forEach(field => {
        if(field.value === parentNode) {
          childConnections.push({
            node,
            field
          });
        }
      })
    })

    return childConnections;
  }

  // TODO: filter anchors that currently cannot be interacted with!
  getAnchorUnderPoint(point: Point): AnchorFind {
    return this.program.nodes.reduce(
      (contender, currentNode) => {

        if(
          contender &&
          contender.node.layer > currentNode.layer
        ) {
          return contender;
        }

        if(
          currentNode.anchor && isPointInAnchor(point, currentNode.anchor, currentNode)
        ) {
          return {
            anchor: currentNode.anchor,
            node: currentNode
          };
        }

        const field = Object.values(currentNode.fields).find(
          currentField => {
            return (
              currentField.type === 'dynamic' && 
              isPointInAnchor(point, currentField.anchor, currentNode)
            );
          },
          null as (Field | null)
        );

        if(!field) return contender;

        return {
          anchor: field.anchor,
          field,
          node: currentNode,
        }
      },
      undefined as AnchorFind
    )
  }

  getNodeUnderPoint(point: Point): NodeFind {
    return this.program.nodes.reduce(
      (contender, node) => {
        if(isPointInRect(point, node)) {
          if(!contender) return node;

          return (
            (contender.layer > node.layer)
            ? contender
            : node
          );
        }
        
        return contender;
      }, 
      undefined as NodeFind
    )
  }
}