import type { Positionable, Program } from "../program/types";
import type { InterfaceNode } from "../program/types";

// import colors from '../../theme/theme.module.scss';
const clearColor = '#00000000';
const colorKeys = [
  'bg', 
  'fg',
  'nodeBg'
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

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {
    this.context = canvas.getContext('2d');
    this.clear();

    const styles = window.getComputedStyle(document.documentElement);
    this.colors = colorKeys.reduce((colors, key) => {
      colors[key] = styles.getPropertyValue(`--c${capitalizeFirstLetter(key)}`);
      return colors;
    }, {} as Colors)
  }

  clear() {
    this.context.clearRect(
      0, 0, this.canvas.width, this.canvas.height
    );

    /*
    this.context.fillStyle = clearColor;

    this.context.fillRect(
      0, 0, this.canvas.width, this.canvas.height
    );
    */
  }

  private getTransformedPositionable(positionable: Positionable): Positionable {
    const position = this.program.position;
    const zoom = this.program.zoom;

    let x = position.x + positionable.x;
    let y = position.y + positionable.y;
    let width = positionable.width;
    let height = positionable.height;

    x *= zoom;
    y *= zoom;
    width *= zoom;
    height *= zoom;

    return {
      x, y, width, height
    }
  }

  private renderNode(node: InterfaceNode) {
    this.context.fillStyle = this.colors.nodeBg;

    const positionable = this.getTransformedPositionable(node);

    this.context.fillRect(
      positionable.x, positionable.y, 
      positionable.width, positionable.height
    );
  }

  render() {
    this.clear();

    const nodes = this.program.nodes;

    nodes.forEach(node => {
      this.renderNode(node);
    })
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }
}