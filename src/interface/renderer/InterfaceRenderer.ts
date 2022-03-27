import { BORDER_WIDTH, CONNECTION_LINE_DIST_POWER, CONNECTION_LINE_MIN_ANCHOR_FORCE, CONNECTION_LINE_WIDTH, EDGE_PADDING, FONT_SIZE, KNOB_SIZE, SPACING } from "../constants";
import type { Point, Rect } from "../types/general";
import type { Anchor, InterfaceNode } from "../types/nodes";
import type { Program } from "../types/program";
import { canConnectAnchors, projectPoint } from "../utils";

// import colors from '../../theme/theme.module.scss';
const colorKeys = [
  'bg', 
  'fg',
  'nodeBg',
  'nodeBgHighlight',
  'nodeBorder'
] as const;

const fontKeys = [
  'displayFont',
  'regularFont'
] as const;

const paddingKeys = [
  'padding-0',
  'padding-1',
  'padding-2',
  'padding-3',
  'padding-4'
] as const;

type Colors = { 
  [key in typeof colorKeys[number]]: string 
};

type Fonts = { 
  [key in typeof fontKeys[number]]: string 
};

type Paddings = { 
  [key in typeof paddingKeys[number]]: string 
};

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const getPropertyObjectFromStyles = (
  keys: string[], 
  styles: CSSStyleDeclaration,
  keyConverter?: (key: string) => string 
) => {
  return keys.reduce((acc, key) => {
    acc[key] = styles.getPropertyValue(
      `--${keyConverter ? keyConverter(key) : key}`
    );
    return acc;
  }, {} as { [key: string]: string});
}

export class InterfaceRenderer {
  private context: CanvasRenderingContext2D;
  private colors: Colors;
  private fonts: Fonts;
  private paddings: Paddings;

  private orderedNodes: InterfaceNode[];

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {
    this.context = canvas.getContext('2d');
    this.resize();
    this.clear();

    const styles = window.getComputedStyle(document.documentElement);
    // TODO fix typing
    this.colors = getPropertyObjectFromStyles(colorKeys as unknown as string[], styles, key => `c${capitalizeFirstLetter(key)}`) as Colors;
    this.fonts = getPropertyObjectFromStyles(fontKeys as unknown as string[], styles) as Fonts;
    this.paddings = getPropertyObjectFromStyles(paddingKeys as unknown as string[], styles) as Paddings;

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
    const rect = this.getTransformedRect(node);

    this.renderFill(rect, node);
    this.renderBorder(rect, node);
    this.renderType(rect, node);
    node.fields.forEach((_, i) => this.renderField(rect, node, i));

    this.renderAnchor(
      rect.x + node.anchor.x / this.program.zoom, 
      rect.y + node.anchor.y / this.program.zoom, 
      node.anchor,
      node
    );

    if(node.anchor.active && this.program.openConnection) {

      const from = { 
        x: rect.x + node.anchor.x / this.program.zoom,
        y: rect.y + node.anchor.y / this.program.zoom 
      };

      from.x += node.anchor.size / (2.0 * this.program.zoom);

      const to = this.program.openConnection.point;

      this.renderConnection(from, to);
    }
  }

  private renderFill(rect: Rect, node: InterfaceNode) {
    this.context.fillStyle = 
      (node.hovered || node.active) ? this.colors.nodeBgHighlight : this.colors.nodeBg;

    this.context.fillRect(
      rect.x, rect.y, 
      rect.width, rect.height
    );
  }

  private renderBorder(rect: Rect, node: InterfaceNode) {
    this.context.lineWidth = BORDER_WIDTH / this.program.zoom;
    if(node.active) {
      this.context.strokeStyle = this.colors.nodeBorder;
      this.context.strokeRect(
        rect.x, rect.y, 
        rect.width, rect.height
      );
    }
  }

  private renderType(rect: Rect, node: InterfaceNode) {
    // TODO abstract font setter to util function
    this.context.font = `${Math.floor(FONT_SIZE / this.program.zoom)}px ${this.fonts.displayFont}`;

    this.context.fillText(
      node.type, rect.x, rect.y - Number.parseInt(this.paddings["padding-1"]) / this.program.zoom
    );
  }

  private renderAnchor(x: number, y: number, anchor: Anchor, node: InterfaceNode) {
    if(anchor.active) {
      this.context.fillStyle = this.colors.nodeBgHighlight;
      this.context.strokeStyle = this.colors.nodeBorder;
    } else if(
      (anchor.hovered && !this.program.openConnection) ||
      (
        this.program.openConnection && canConnectAnchors(
          this.program.openConnection.anchor,
          this.program.openConnection.node,
          anchor,
          node
        )
      )
    ) {
      this.context.fillStyle = this.colors.nodeBgHighlight;
      this.context.strokeStyle = this.colors.fg;
    } else {
      this.context.fillStyle = this.colors.nodeBg;
      this.context.strokeStyle = this.colors.nodeBgHighlight;
    }

    this.context.lineWidth = BORDER_WIDTH / this.program.zoom;
    this.renderKnob(x, y);
  }

  private renderKnob(x: number, y: number, size: number = KNOB_SIZE / this.program.zoom) {
    this.context.beginPath();
    this.context.arc(
      x, y, size, 0, 2 * Math.PI,
      false
    );

    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  private renderField(rect: Rect, node: InterfaceNode, fieldIndex: number) {
    const zoom = this.program.zoom;
    const field = node.fields[fieldIndex];

    this.context.font = `${Math.floor(FONT_SIZE / zoom)}px ${this.fonts.displayFont}`;

    this.context.fillStyle = this.colors.fg;

    const x = rect.x + (field.anchor.x + EDGE_PADDING) / zoom;
    const y = rect.y + field.anchor.y / zoom;

    this.context.fillText(
      field.name, x, y + field.anchor.size / ( zoom * 4.0 )
    );
    
    if(field.type === 'dynamic') {
      // Render open connection
      if(field.anchor.active && this.program.openConnection) {

        const from = { ...this.program.openConnection.point }; 
        const to = { x: rect.x, y };
        to.x += field.anchor.size / (2.0 * zoom);

        this.renderConnection(from, to);
      }

      if(typeof field.value !== 'number') {
        const sourceRect = this.getTransformedRect(field.value);

        const from = {
          x: (sourceRect.x + field.value.anchor.x / this.program.zoom),
          y: (sourceRect.y + field.value.anchor.y / this.program.zoom),
        }
        from.x += field.anchor.size / (2.0 * zoom);
          // field.value.anchor;
        const to = { x: rect.x, y };

        this.renderConnection(from, to);
      }

      this.renderAnchor(rect.x, y, field.anchor, node);
    }
  }

  private renderConnection = (from: Point, to: Point) => {
    const controlPointForce = 
      Math.max(
        Math.pow((Math.abs(to.x - from.x) + Math.abs(to.y - from.y)) / 2.0, CONNECTION_LINE_DIST_POWER),
        CONNECTION_LINE_MIN_ANCHOR_FORCE
      );

    this.context.strokeStyle = this.colors.nodeBorder;
    this.context.lineWidth = CONNECTION_LINE_WIDTH / this.program.zoom;

    this.context.beginPath();
    this.context.moveTo(from.x, from.y);
    this.context.bezierCurveTo(
      from.x + controlPointForce, from.y, // control point 1
      to.x - controlPointForce, to.y,     // control point 2
      to.x, to.y                          // end point
    );
    this.context.stroke();
  }

  render() {
    this.clear();

    // TODO sort nodes in with respect to layers and if they are elevated or not
    this.orderedNodes.forEach(node => {
      this.renderNode(node);
    })

    // Render connections
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