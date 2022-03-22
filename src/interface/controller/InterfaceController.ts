import { fromEvent } from "rxjs";
import type { InterfaceNode, Point, Program } from "../program/types";
import { ZOOM_SPEED } from "./constants";
import { InterfaceEventEmitter } from "./events/InterfaceEventEmitter";
import { SelectionManager } from "./SelectionManager";
import { getRelativeMousePoisition, zoomAroundPoint } from "./utils";

export class InterfaceController extends InterfaceEventEmitter {
  private selectionManager: SelectionManager;
  private hoveredNode?: InterfaceNode;
  private activeNode?: InterfaceNode; // Node currently clicked/grabbed by cursor
  private selectedNodes: InterfaceNode[];

  private mousePressed: boolean;
  private isDragging: boolean;

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {
    super();

    this.selectionManager = new SelectionManager(
      canvas,
      program
    );

    this.selectedNodes = [];

    // TODO: everything offset in X dir.... why?

    // TODO: 

    // TODO: consider having special key combo for moving view, instead of doing it when selecting background

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
    // If no node is grabbed, move the entire view
    if(!this.activeNode) {
      const offset = this.applyCursorOffset(this.program.position, e);

      this.emit('moveView', {
        offset
      });
    }
    // Otherwise, if a node is grabbed, move that node
    else {
      const previousPosition = { x: this.activeNode.x, y: this.activeNode.y };
      this.applyCursorOffset(this.activeNode, e);

      this.emit('translateNodes', {
        previousPositions: [previousPosition],
        nodes: [this.activeNode]
      });
    }
  }

  private onPress(e: MouseEvent) {
    let updated = false;
    this.mousePressed = true;

    const previousActiveNode = this.activeNode;
    this.activeNode = this.hoveredNode;

    if(previousActiveNode && (previousActiveNode != this.activeNode)) {
      previousActiveNode.active = false;
      updated = true;
    }

    if(this.activeNode) {
      this.activeNode.active = true;
      this.activeNode.elevated = true;
      updated = true;

      this.emit('activateNode', {
        node: this.activeNode,
        previous: previousActiveNode
      });
    }

    if(updated) {
      const previousSelectedNodes = this.selectedNodes;
      this.selectedNodes = this.activeNode 
        ? [this.activeNode]
        : [];

      this.emit('selectNodes', {
        nodes: this.selectedNodes,
        previous: previousSelectedNodes
      });

      this.emit('grabbedNodes', {
        nodes: this.selectedNodes
      })
    }
  }

  private onRelease(e: MouseEvent) {
    this.mousePressed = false;
    this.isDragging = false;

    if(this.activeNode) {
      this.activeNode.elevated = false;
      this.emit('releasedNodes', {
        nodes: [this.activeNode]
      });
    }
  }

  private onMove(e: MouseEvent) {
    let updated = false;

    const previousHoveredNode = this.hoveredNode;
    this.hoveredNode = this.selectionManager.getNodeUnderPoint(
      getRelativeMousePoisition(e, this.canvas)
    );

    if(previousHoveredNode && (previousHoveredNode != this.hoveredNode)) {
      previousHoveredNode.hovered = false;
      updated = true;
    }

    if(this.hoveredNode) {
      document.body.style.cursor = 'pointer';
      this.hoveredNode.hovered = true;
      updated = true;
    } else {
      document.body.style.cursor = 'unset';
    }

    if(updated) {
      this.emit('hoverNode', {
        node: this.hoveredNode,
        previous: previousHoveredNode
      });
    }

    if(this.mousePressed) {
      this.onDrag(e);
    }
  }

  private onKey(e: KeyboardEvent) {
    console.log(e.key);
  }

  private onZoom(e: WheelEvent) {
    // Update zoom
    const delta = this.program.zoom * (Math.sign(e.deltaY) * ZOOM_SPEED);

    const previousZoom = this.program.zoom;

    zoomAroundPoint(
      delta, 
      getRelativeMousePoisition(e, this.canvas),
      { x: this.canvas.width / 2.0, y: this.canvas.height / 2.0 },
      this.program
    );

    this.emit('zoomView', {
      zoom: this.program.zoom,
      previousZoom
    });
  }

  // Util functions
  private applyCursorOffset(point: Point, mouseEvent: MouseEvent) {
    const offset = {
      x: mouseEvent.movementX * this.program.zoom,
      y: mouseEvent.movementY * this.program.zoom
    };

    point.x += offset.x;
    point.y += offset.y;

    return offset;
  }
}