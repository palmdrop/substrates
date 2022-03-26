import { fromEvent } from "rxjs";
import type { Point } from "../types/general";
import type { InterfaceNode } from "../types/nodes";
import type { Program } from "../types/program";
import { getRelativeMousePoisition, unprojectPoint, zoomAroundPoint } from "../utils";
import { ZOOM_SPEED } from "../constants";
import { InterfaceEventEmitter } from "./events/InterfaceEventEmitter";
import { SelectionManager } from "./SelectionManager";
import type { AnchorData } from "../types/connections";

export class InterfaceController extends InterfaceEventEmitter {
  private selectionManager: SelectionManager;
  private topLayerNode: InterfaceNode; // Node at the top layer

  private hoveredNode?: InterfaceNode;
  private activeNode?: InterfaceNode; // Node currently clicked/grabbed by cursor
  private selectedNodes: InterfaceNode[];

  private hoveredAnchorData?: AnchorData;
  private activeAnchorData?: AnchorData;

  private mousePressed: boolean;
  private mousePosition: Point;

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

    this.mousePosition = { x: 0, y: 0 };

    this.topLayerNode = this.program.nodes.reduce(
      (contender, current) => {
        if(!contender) return current;
        return current.layer > contender.layer
          ? current 
          : contender;
      }, 
      undefined
    );

    // TODO: everything offset in X dir.... why?

    // TODO: 

    // TODO: consider having special key combo for moving view, instead of doing it when selecting background

    fromEvent(this.canvas, "mousedown")
      .subscribe((e: MouseEvent) => this.onPress(e))

    fromEvent(this.canvas, "mouseup")
      .subscribe((e: MouseEvent ) => this.onRelease(e))

    fromEvent(this.canvas, "mousemove")
      .subscribe((e: MouseEvent) => this.onMove(e))

    fromEvent(this.canvas, "mouseleave")
      .subscribe(() => this.reset())

    fromEvent(window, "keydown")
      .subscribe((e: KeyboardEvent) => this.onKey(e))

    fromEvent(this.canvas, "wheel")
      .subscribe((e: WheelEvent) => this.onZoom(e))
  }

  private onDrag(e: MouseEvent) {
    // TODO: if dragging close to border, always move field of vision
    if(this.activeAnchorData) {
      if(!this.program.openConnection) {
        // this.program.openConnectionPoint = { x: 0, y: 0 };
        this.program.openConnection = {
          ...this.activeAnchorData,
          point: { x: 0, y: 0 },
        }
      }

      this.program.openConnection.point.x = this.mousePosition.x;
      this.program.openConnection.point.y = this.mousePosition.y;

      this.emit('moveOpenNodeConnection', this.program.openConnection);
    
    } else if(this.activeNode) { // If no node is grabbed, move the entire view
      const previousPosition = { x: this.activeNode.x, y: this.activeNode.y };
      this.applyCursorOffset(this.activeNode, e);

      this.emit('translateNodes', {
        previousPositions: [previousPosition],
        nodes: [this.activeNode]
      });
    } else { // Otherwise, if a node is grabbed, move that node
      const offset = this.applyCursorOffset(this.program.position, e);

      this.emit('moveView', {
        offset
      });
    }
  }

  // TODO cleanup
  private onPress(e: MouseEvent) {
    let updated = false;
    this.mousePressed = true;

    const previousActiveAnchorData = this.activeAnchorData;
    const previousActiveNode = this.activeNode;
    this.activeNode = this.hoveredNode;

    this.activeAnchorData = this.hoveredAnchorData;

    if(previousActiveAnchorData && (previousActiveAnchorData.anchor != this.activeAnchorData?.anchor)) {
      previousActiveAnchorData.anchor.active = false;
      updated = true;
    }

    if(this.activeAnchorData) {
      this.activeAnchorData.anchor.active = true;
      this.emit('activateNodeAnchor', this.activeAnchorData);
    }

    if(previousActiveNode && (previousActiveNode != this.activeNode)) {
      previousActiveNode.active = false;
      previousActiveNode.elevated = false;
      updated = true;
    }

    if(this.activeNode) {
      this.activeNode.active = true;
      this.elvateNode(this.activeNode);
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
    if(!this.mousePressed) return;
    this.mousePressed = false;

    if(this.activeNode) {
      this.activeNode.elevated = false;
      this.emit('releasedNodes', {
        nodes: [this.activeNode]
      });
    }

    if(this.activeAnchorData) {
      this.activeAnchorData.anchor.active = false;
      this.emit('releaseNodeAnchor', this.activeAnchorData);
      this.activeAnchorData = null;

      this.program.openConnection = null;
    }
  }

  private onMove(e: MouseEvent) {
    let updated = false;

    const relativeMousePosition = getRelativeMousePoisition(e, this.canvas);
    const transformedMousePosition = 
      unprojectPoint(
        relativeMousePosition,
        this.program,
        this.canvas
      );

    this.mousePosition.x = relativeMousePosition.x;
    this.mousePosition.y = relativeMousePosition.y;

    const previousHoveredAchorData = this.hoveredAnchorData;
    const previousHoveredNode = this.hoveredNode;

    this.hoveredAnchorData = this.selectionManager.getAnchorUnderPoint(
      transformedMousePosition
    );

    if(previousHoveredAchorData && (previousHoveredAchorData.anchor != this.hoveredAnchorData?.anchor)) {
      previousHoveredAchorData.anchor.hovered = false;
      updated = false;
    }

    if(this.hoveredAnchorData) {
      this.hoveredAnchorData.anchor.hovered = true;
      this.hoveredNode = this.hoveredAnchorData.node;

      this.emit('hoveredNodeAnchor', this.hoveredAnchorData);
    } else {
      this.hoveredNode = this.selectionManager.getNodeUnderPoint(
        transformedMousePosition
      );
    }

    if(previousHoveredNode && (previousHoveredNode != this.hoveredNode)) {
      previousHoveredNode.hovered = false;
      updated = true;
    }

    if(this.hoveredNode || this.hoveredAnchorData) {
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

  private elvateNode(node: InterfaceNode) {
    const layer = node.layer;
    node.elevated = true;
    node.layer = this.topLayerNode.layer;
    // TODO clarify, assign toplayernode to separate var
    this.topLayerNode.layer = layer;
    this.topLayerNode.elevated = false;

    this.topLayerNode = node;
  }

  private reset() {
    this.mousePressed = false;
    this.hoveredNode = undefined;
    this.activeAnchorData = null;
    this.hoveredAnchorData = null;
    this.program.openConnection = null;

    this.emit('nodeViewReset');
  }
}