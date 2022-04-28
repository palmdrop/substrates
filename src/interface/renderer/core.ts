import { GlslType } from '../../shader/types/core';
import { capitalizeFirstLetter } from '../../utils/general';
import { BORDER_WIDTH, FONT_SIZE } from '../constants';
import { Point, Rect } from '../types/general';
import { Colors } from './constants';

export const getConnectionColor = (type: GlslType, colors: Colors) => {
  const key = `nodeConnection${ capitalizeFirstLetter(type) }`;
  return Object.hasOwn(colors, key) ? colors[key as keyof Colors] : colors.fg;
};

export const renderFill = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.fillRect(
    rect.x, rect.y, 
    rect.width, rect.height
  );
};

export const renderBorder = (context: CanvasRenderingContext2D, rect: Rect, colors: Colors, zoom: number, active: boolean) => {
  context.lineWidth = BORDER_WIDTH / zoom;

  const color = active ? colors.nodeActiveBorder : colors.nodeBorder;

  context.strokeStyle = color;
  context.strokeRect(
    rect.x, rect.y, 
    rect.width, rect.height
  );
};

export const renderType = (context: CanvasRenderingContext2D, text: string, position: Point, zoom: number, font: string) => {
  // TODO abstract font setter to util function
  context.font = `${ Math.floor(FONT_SIZE / zoom) }px ${ font }`;

  context.fillText(
    text, position.x, position.y
  );
};
