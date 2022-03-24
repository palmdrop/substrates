import { BORDER_WIDTH, EDGE_PADDING, FONT_SIZE, SPACING } from "../constants";
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

  private renderField(rect: Rect, node: InterfaceNode, fieldIndex: number) {
    const zoom = this.program.zoom;

    const renderKnob = ({ x = rect.x, y }: { x?: number, y: number }) => {
      const knobSize = 0.5 * FONT_SIZE / zoom;

      this.context.beginPath();
      this.context.arc(
        x, y - knobSize / 2.0, knobSize, 0, 2 * Math.PI,
        false
      );
      this.context.fillStyle = this.colors.nodeBg;
      this.context.strokeStyle = this.colors.nodeBgHighlight;
      this.context.lineWidth = BORDER_WIDTH / zoom;

      this.context.fill();
      this.context.stroke();

      this.context.closePath();
    }

    const field = node.fields[fieldIndex];
    this.context.font = `${Math.floor(FONT_SIZE / zoom)}px ${this.fonts.displayFont}`;

    this.context.fillStyle = this.colors.fg;

    const minYOffset = (fieldIndex * rect.height / node.fields.length); 

    const x = rect.x + EDGE_PADDING / zoom;
    const y = 
      rect.y + 
      (1.25 * EDGE_PADDING) / zoom + 
      Math.max(
        ((SPACING + FONT_SIZE) * fieldIndex) / zoom,
        minYOffset
      );

    this.context.fillText(
      field.name, x, y
    );
    
    renderKnob({ y });

    renderKnob({ 
      x: rect.x + rect.width,
      y: rect.y + rect.height / 2.0 
    })
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