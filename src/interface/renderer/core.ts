import { BORDER_WIDTH, FONT_SIZE } from '../constants';
import { Rect } from '../types/general';

export const renderFill = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.fillRect(
    rect.x, rect.y, 
    rect.width, rect.height
  );
};

export const renderBorder = (context: CanvasRenderingContext2D, rect: Rect, color: string, zoom: number, active: boolean) => {
  context.lineWidth = BORDER_WIDTH / zoom;
  if(active) {
    context.strokeStyle = color;
    context.strokeRect(
      rect.x, rect.y, 
      rect.width, rect.height
    );
  }
};

export const renderType = (context: CanvasRenderingContext2D, text: string, rect: Rect, zoom: number, font: string) => {
  // TODO abstract font setter to util function
  context.font = `${ Math.floor(FONT_SIZE / zoom) }px ${ font }`;

  context.fillText(
    text, rect.x, rect.y
  );
};
