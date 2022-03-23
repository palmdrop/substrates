import type { Rect } from "../types/general";
import type { InterfaceNode } from "../types/nodes";
import type { Program } from "../types/program";
import { projectPoint } from "../utils";

// import colors from '../../theme/theme.module.scss';
const colorKeys = [
  'bg', 
  'fg',
  'nodeBg',
  'nodeBgHighlight',
  'nodeBorder'
] as const;

type Colors = { 
  [key in typeof colorKeys[number]]: string 
};

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export class InterfaceRenderer {
  private context: CanvasRenderingContext2D;
  private colors: Colors;

  private orderedNodes: InterfaceNode[];

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {
    this.context = canvas.getContext('2d');
    this.resize();
    this.clear();

    const styles = window.getComputedStyle(document.documentElement);
    this.colors = colorKeys.reduce((colors, key) => {
      colors[key] = styles.getPropertyValue(`--c${capitalizeFirstLetter(key)}`);
      return colors;
    }, {} as Colors)

    this.orderedNodes = [];
    this.orderNodes();
  }

  clear() {
    this.context.clearRect(
      0, 0, this.canvas.width, this.canvas.height
    );
  }

  private getTransformedRect(rect: Rect): Rect {
    const point = projectPoint(rect, this.program, this.canvas);

    return {
      ...point, 
      width: rect.width / this.program.zoom, 
      height: rect.height / this.program.zoom
    }
  }

  private renderNode(node: InterfaceNode) {
    this.context.fillStyle = 
      (node.hovered || node.active) ? this.colors.nodeBgHighlight : this.colors.nodeBg;

    const rect = this.getTransformedRect(node);

    this.context.fillRect(
      rect.x, rect.y, 
      rect.width, rect.height
    );

    if(node.active) {
      this.context.strokeStyle = this.colors.nodeBorder;
      this.context.strokeRect(
        rect.x, rect.y, 
        rect.width, rect.height
      );
    }
  }

  render() {
    this.clear();

    // TODO sort nodes in with respect to layers and if they are elevated or not
    this.orderedNodes.forEach(node => {
      this.renderNode(node);
    })
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  orderNodes() {
    this.orderedNodes = this.program.nodes.sort(
      (node1, node2) => (
        node1.layer - node2.layer
      )
    );
  }
}