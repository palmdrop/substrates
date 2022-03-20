import { fromEvent } from "rxjs";
import type { Position, Program } from "../program/types";
import { ZOOM_SPEED } from "./constants";

export class InterfaceController {
  private onUpdateCallback?: () => void;

  private mousePressed: boolean;
  private mousePosition: Position;
  private isDragging: boolean;

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {

    fromEvent(this.canvas, "mousedown")
      .subscribe((e: MouseEvent) => this.onPress(e))

    fromEvent(this.canvas, "mouseup")
      .subscribe((e: MouseEvent ) => this.onRelease(e))

    fromEvent(this.canvas, "mousemove")
      .subscribe((e: MouseEvent) => this.onMove(e))

    fromEvent(window, "keydown")
      .subscribe((e: KeyboardEvent) => this.onKey(e))

    fromEvent(this.canvas, "wheel")
      .subscribe((e: WheelEvent) => this.onZoom(e))
  }

  private onDrag(e: MouseEvent) {
    this.program.position.x += e.movementX / this.program.zoom;
    this.program.position.y += e.movementY / this.program.zoom;

    this.updated();
  }

  private onPress(e: MouseEvent) {
    this.mousePressed = true;
  }

  private onRelease(e: MouseEvent) {
    this.mousePressed = false;
    this.isDragging = false;
  }

  private onMove(e: MouseEvent) {
    if(this.mousePressed) {
      this.onDrag(e);
    }
  }

  private onKey(e: KeyboardEvent) {
    console.log(e.key);
  }

  private onZoom(e: WheelEvent) {
    this.program.zoom *= (1.0 + Math.sign(e.deltaY) * ZOOM_SPEED);
    this.updated();
  }

  onUpdate(onUpdateCallback: () => void) {
    this.onUpdateCallback = onUpdateCallback;
  }

  private updated() {
    this.onUpdateCallback?.();
  }
}