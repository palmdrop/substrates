import { fromEvent, Subscription } from 'rxjs';

import { buildProgramFunction } from '../../shader/builder/programBuilder';
import { iterateDepthFirst } from '../../shader/builder/utils/general';
import { popProgram, pushProgram } from '../../stores/programStore';
import { shaderMaterial$ } from '../../stores/shaderStore';
import { ZOOM_SPEED } from '../constants';
import { nodeCreatorMap,NodeKey, ShaderNode } from '../program/nodes';
import { connectNodes, disconnectField, disconnectNodeOutPut } from '../program/Program';
import { duplicateNode, isShaderNode, setAllUniforms } from '../program/utils';
import type { Point } from '../types/general';
import { DynamicField, Field } from '../types/nodes';
import type { AnchorData } from '../types/program/connections';
import type { Program } from '../types/program/program';
import { canConnectAnchors, centerProgram, fitProgram, getRelativeMousePosition, unprojectPoint, zoomAroundPoint } from '../utils';
import { InterfaceEventEmitter } from './events/InterfaceEventEmitter';
import { SelectionManager } from './SelectionManager';

export {
  centerProgram,
  fitProgram 
};

export class InterfaceController extends InterfaceEventEmitter {
  private selectionManager: SelectionManager;
  private topLayerNode: ShaderNode; // Node at the top layer

  private hoveredNode?: ShaderNode;
  private activeNode?: ShaderNode; // Node currently clicked/grabbed by cursor
  private selectedNodes: ShaderNode[] = [];

  private hoveredAnchorData?: AnchorData;
  private activeAnchorData?: AnchorData;

  private mousePressed = false;
  private isDragging = false;
  private nodeMoving = false;

  private mousePosition: Point;

  private subscriptions: Subscription[] = [];

  constructor(
    private program: Program,
    private canvas: HTMLCanvasElement
  ) {
    super();

    program.nodes.forEach(node => {
      if(node.hovered) {
        node.hovered = false;
      }

      if(node.active) {
        this.activeNode = node;
        this.selectedNodes.push(node);
      }

    });

    this.selectionManager = new SelectionManager(
      canvas,
      program
    );

    this.mousePosition = { x: 0, y: 0 };

    this.topLayerNode = this.program.nodes.reduce(
      (contender, current) => {
        if(!contender) return current;
        return current.layer > contender.layer
          ? current 
          : contender;
      }, 
      undefined as ShaderNode | undefined
    ) as ShaderNode;

    // TODO: consider having special key combo for moving view, instead of doing it when selecting background
    this.subscriptions.push(fromEvent<MouseEvent>(this.canvas, 'mousedown')
      .subscribe((e: MouseEvent) => this.onPress(e)));

    this.subscriptions.push(fromEvent<MouseEvent>(this.canvas, 'mouseup')
      .subscribe((e: MouseEvent) => this.onRelease(e)));

    this.subscriptions.push(fromEvent<MouseEvent>(this.canvas, 'mousemove')
      .subscribe((e: MouseEvent) => this.onMove(e)));

    this.subscriptions.push(fromEvent<MouseEvent>(this.canvas, 'mouseleave')
      .subscribe(() => this.reset()));

    this.subscriptions.push(fromEvent<KeyboardEvent>(window, 'keydown')
      .subscribe((e: KeyboardEvent) => this.onKey(e)));

    this.subscriptions.push(fromEvent<WheelEvent>(this.canvas, 'wheel')
      .subscribe((e: WheelEvent) => this.onZoom(e)));
  }

  private onDrag(e: MouseEvent) {
    this.isDragging = true;

    // TODO: if dragging close to border, always move field of vision
    if(this.activeAnchorData) {
      if(!this.program.openConnection) {
        this.program.openConnection = {
          ...this.activeAnchorData,
          point: { x: 0, y: 0 },
        };
      }

      this.program.openConnection.point.x = this.mousePosition.x;
      this.program.openConnection.point.y = this.mousePosition.y;

      this.emit('moveOpenNodeConnection', this.program.openConnection);
    
    } else if(this.activeNode) { // If a node is grabbed, move that node
      const previousPosition = { x: this.activeNode.x, y: this.activeNode.y };
      this.applyCursorOffset(this.activeNode, e);

      this.emit('translateNodes', {
        previousPositions: [previousPosition],
        nodes: [this.activeNode]
      });

      this.nodeMoving = true;
    } else { // If no node is grabbed, move the entire view
      const offset = this.applyCursorOffset(this.program.position, e);

      this.emit('moveView', {
        offset
      });
    }
  }

  // TODO cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onPress(_: MouseEvent) {
    if(this.program.hidden) return;

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

      this.emit('deactivateNode', { node: previousActiveNode });

      updated = true;
    }

    if(this.activeNode) {
      this.activeNode.active = true;
      this.elevateNode(this.activeNode);
      updated = true;

      this.emit('activateNode', {
        node: this.activeNode,
        previous: previousActiveNode
      });
    }

    if(this.program.unplacedNode) {
      // TODO abstract to helper function?
      const newNode = this.program.unplacedNode;
      this.program.nodes.push(newNode);
      this.program.unplacedNode = undefined;

      this.elevateNode(newNode);
      this.hoveredNode = newNode;

      if(this.activeNode) this.activeNode.active = false;

      this.emit('activateNode', {
        node: newNode,
        previous: this.activeNode
      });

      this.activeNode = newNode;
      this.activeNode.active = true;

      this.emit('addNodes', {
        nodes: [newNode]
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
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onRelease(_: MouseEvent) {
    if(!this.mousePressed || this.program.hidden) return;
    const wasDragging = this.isDragging;
    this.mousePressed = false;
    this.isDragging = false;

    if(this.activeNode) {
      this.activeNode.elevated = false;

      if(wasDragging) {
        this.emit('releasedNodes', {
          nodes: [this.activeNode]
        });
      }

      if(wasDragging && this.nodeMoving) {
        this.nodeMoving = false;

        this.emit('droppedNodes', {
          nodes: [this.activeNode]
        });
      }
    }

    if(
      this.activeAnchorData
    ) {
      if(
        this.hoveredAnchorData &&
        canConnectAnchors(
          this.activeAnchorData.anchor,
          this.activeAnchorData.node,
          this.activeAnchorData.field ? this.activeAnchorData.field.type : this.activeAnchorData.node.returnType,
          this.hoveredAnchorData.anchor,
          this.hoveredAnchorData.node,
          this.hoveredAnchorData.field ? this.hoveredAnchorData.field.type : this.hoveredAnchorData.node.returnType
        )
      ) {
        const { field, node } = this.activeAnchorData.field 
          ? this.activeAnchorData
          : this.hoveredAnchorData;

        const otherNode = this.activeAnchorData.field 
          ? this.hoveredAnchorData.node
          : this.activeAnchorData.node;

        if(field && connectNodes(node, field, otherNode)) {
          this.emit('connectNodes', {
            node,
            field,
            source: otherNode
          });
        }
      } else if(!wasDragging) {
        // A field anchor is being disconnected
        if(this.activeAnchorData.field && typeof this.activeAnchorData.field.value === 'object') {
          const node = this.activeAnchorData.field.value as ShaderNode;

          disconnectField(this.activeAnchorData.field);
          this.emit('disconnectNodes', {
            node,
            connections: [
              {
                field: this.activeAnchorData.field,
                node: this.activeAnchorData.node
              }
            ]
          });
        // A node anchor is being disconnected
        } else if(!this.activeAnchorData.field) {
          const childConnections = disconnectNodeOutPut(this.activeAnchorData.node, this.selectionManager);

          this.emit('disconnectNodes', {
            node: this.activeAnchorData.node,
            connections: childConnections
          });
        }
      }

      if(this.activeAnchorData) {
        const previousActiveAnchorData = this.activeAnchorData;
        this.activeAnchorData.anchor.active = false;
        this.activeAnchorData = undefined;
        this.program.openConnection = undefined;
        this.emit('releaseNodeAnchor', previousActiveAnchorData);
      }
    }
  }

  private onMove(e: MouseEvent) {
    if(this.program.hidden) return;

    const relativeMousePosition = getRelativeMousePosition(e, this.canvas);
    const transformedMousePosition = 
      unprojectPoint(
        relativeMousePosition,
        this.program,
        this.canvas
      );

    this.mousePosition.x = relativeMousePosition.x;
    this.mousePosition.y = relativeMousePosition.y;

    const previousHoveredAnchorData = this.hoveredAnchorData;
    const previousHoveredNode = this.hoveredNode;

    this.hoveredAnchorData = this.selectionManager.getAnchorUnderPoint(
      transformedMousePosition
    );

    if(previousHoveredAnchorData) {
      previousHoveredAnchorData.anchor.hovered = false;
    }

    if(this.hoveredAnchorData) {
      this.hoveredAnchorData.anchor.hovered = true;
      this.hoveredNode = this.hoveredAnchorData.node;
    } else {
      this.hoveredNode = this.selectionManager.getNodeUnderPoint(
        transformedMousePosition
      );
    }

    if(previousHoveredAnchorData !== this.hoveredAnchorData) {
      this.emit('hoveredNodeAnchor', this.hoveredAnchorData);
    }

    if(previousHoveredNode && (previousHoveredNode !== this.hoveredNode)) {
      previousHoveredNode.hovered = false;
    }

    if(this.program.unplacedNode) {
      document.body.style.cursor = 'move';
    } else if(this.hoveredNode || this.hoveredAnchorData) {
      document.body.style.cursor = 'pointer';
      if(this.hoveredNode) this.hoveredNode.hovered = true;

    } else {
      document.body.style.cursor = 'unset';
    }

    if(previousHoveredNode !== this.hoveredNode) {
      this.emit('hoverNode', {
        node: this.hoveredNode,
        previous: previousHoveredNode
      });
    }

    if(this.program.unplacedNode) {
      this.program.unplacedNode.x = 
        transformedMousePosition.x - this.program.unplacedNode.width / 2.0;
      this.program.unplacedNode.y = 
        transformedMousePosition.y - this.program.unplacedNode.height / 2.0;

      this.emit('moveUnplacedNode', { node: this.program.unplacedNode });
    } else if(this.mousePressed) {
      this.onDrag(e);
    }
  }

  private onKey(e: KeyboardEvent) {
    switch(e.key) {
      case 'Delete':
      case 'Backspace': {
        if(this.program.hidden) return;
        this.deleteSelectedNodes();
      } break;
      case 'Escape': {
        if(this.program.hidden) return;
        if(this.program.unplacedNode) {
          const node = this.program.unplacedNode;
          this.program.unplacedNode = undefined;
          this.emit('cancelUnplacedNode', { node });
        }
      } break;
      case 'c': {
        if(this.program.hidden) return;
        if(centerProgram(this.program)) {
          this.emit('moveView', {
            offset: this.program.position
          });
        }
      } break;
      case 'r': {
        if(this.program.hidden) return;
        if(centerProgram(this.program)) {
          this.emit('moveView', {
            offset: this.program.position
          });
        }

        if(this.program.zoom !== 1.0) {
          const previousZoom = this.program.zoom;
          this.program.zoom = 1.0;
          this.emit('zoomView', {
            previousZoom,
            zoom: 1.0
          });
        }
      } break;
      case 'f': {
        if(this.program.hidden) return;
        const previousZoom = this.program.zoom;
        const { moved, zoomed } = fitProgram(this.program, this.canvas);
        if(moved) {
          this.emit('moveView', {
            offset: { x: 0, y: 0 }
          });
        }

        if(zoomed) {
          this.emit('zoomView', {
            previousZoom,
            zoom: this.program.zoom
          });
        }
      } break;
      case 'h': {
        this.program.hidden = !this.program.hidden;
        this.program.unplacedNode = undefined;
        document.body.style.cursor = 'unset';
        this.emit('visibilityChange', {
          visible: this.program.hidden
        });
      } break;
      case 'd': {
        if(e.ctrlKey && this.activeNode) {
          const duplicate = duplicateNode(this.activeNode);
          this.addUnplacedNode(duplicate, this.activeNode.x, this.activeNode.y);
        }
      } break;
      case 'p': {
        this.emit('captureRequested', undefined);
      } break;
      case 's': {
        this.emit('saveRequested', undefined);
      } break;
      case 'z': {
        if(e.ctrlKey) {
          popProgram();
        }
      } break;

      // testing
      case 'v': {
        console.log(
          buildProgramFunction(this.program).functions['programFunction'].body
        );
      }
    }
  }

  private onZoom(e: WheelEvent) {
    if(this.program.hidden) return;

    // Update zoom
    const delta = this.program.zoom * (Math.sign(e.deltaY) * ZOOM_SPEED);

    const previousZoom = this.program.zoom;

    zoomAroundPoint(
      delta, 
      getRelativeMousePosition(e, this.canvas),
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

  private elevateNode(node: ShaderNode) {
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

    if(this.activeAnchorData) {
      this.activeAnchorData.anchor.active = false;
      this.activeAnchorData.anchor.hovered = false;
      this.activeAnchorData = undefined;
    }

    if(this.hoveredAnchorData) {
      this.hoveredAnchorData.anchor.active = false;
      this.hoveredAnchorData.anchor.hovered = false;
      this.hoveredAnchorData = undefined;
    }

    this.program.openConnection = undefined;

    this.emit('nodeViewReset', undefined);
  }

  addUnplacedNode(node: NodeKey | ShaderNode, x: number, y: number) {
    if(!isShaderNode(node)) {
      node = nodeCreatorMap[node](0, 0);
    }

    const { x: px, y: py } = unprojectPoint(
      {
        x,
        y,
      },
      this.program,
      this.canvas
    );


    node.x = px;
    node.y = py;

    this.program.unplacedNode = node;

    this.emit('addUnplacedNode', { node });
  }

  addNode(type: NodeKey, x: number, y: number) {
    const node = nodeCreatorMap[type](0, 0);

    const { x: px, y: py } = unprojectPoint(
      {
        x,
        y,
      },
      this.program,
      this.canvas
    );


    node.x = px;
    node.y = py;

    this.program.nodes.push(node);

    this.emit('addNodes', {
      nodes: [node]
    });
  }

  deleteSelectedNodes() {
    const toDelete = this.selectedNodes.filter(node => node.type !== 'root');

    this.selectedNodes = [];
    let needsRecompile = false;

    const disconnectNode = (node: ShaderNode) => {
      let change = false;
      Object.values(node.fields).forEach((field: Field) => {
        if(
          toDelete.includes(field.value as ShaderNode)
        ) {
          disconnectField(field as DynamicField);
          change = true;
        }
      });

      return change;
    };

    const visited: ShaderNode[] = [];
    iterateDepthFirst(this.program.rootNode, node => {
      const disconnected = disconnectNode(node);
      needsRecompile ||= disconnected;
      visited.push(node);
    });

    // TODO: O(n^2), optimize with lodash?
    this.program.nodes.forEach(node => {
      if(visited.includes(node)) return;
      disconnectNode(node);
    });

    this.program.nodes = this.program.nodes.filter(node => !toDelete.includes(node));

    if(toDelete.length) {
      this.emit('deleteNodes', { 
        nodes: toDelete,
        needsRecompile
      });
    }
  }

  dispose() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}