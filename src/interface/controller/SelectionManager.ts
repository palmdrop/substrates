import type { AnchorData } from "../types/connections";
import type { Point } from "../types/general";
import type { Connection, InterfaceNode, NodeField } from "../types/nodes";
import type { Program } from "../types/program";
import { isPointInAnchor, isPointInRect, unprojectPoint } from "../utils";

type NodeFind 
  = InterfaceNode 
  | null;

type AnchorFind 
  = AnchorData
  | null;

export class SelectionManager {
  constructor(
    private canvas: HTMLCanvasElement,
    private program: Program
  ) {

    // TODO use grid or quad tree to optimize selections
    // Give an "update" method that is called when nodes are moved (only when released!)
  }

  // TODO: optimize
  getChildConnections(parentNode: InterfaceNode) {
    const childConnections: Connection[] = [];

    this.program.nodes.forEach(node => {
      if(node === parentNode) return;

      node.fields.forEach(field => {
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
          isPointInAnchor(point, currentNode.anchor, currentNode)
        ) {
          return {
            anchor: currentNode.anchor,
            node: currentNode
          };
        }

        const field = currentNode.fields.find(
          currentField => {
            return (
              currentField.type === 'dynamic' && 
              isPointInAnchor(point, currentField.anchor, currentNode)
            );
          },
          null as (NodeField | null)
        );

        if(!field) return contender;

        return {
          anchor: field.anchor,
          field,
          node: currentNode,
        }
      },
      null as AnchorFind
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
      null as NodeFind
    )
  }
}