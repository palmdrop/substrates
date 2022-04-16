<script lang="ts">
  import { fromEvent } from 'rxjs';
  import * as THREE from 'three';

  import { InterfaceController } from '../../interface/controller/InterfaceController';
  import { NodeKey } from '../../interface/program/nodes';
  import { createDefaultProgram } from '../../interface/program/Program';
  import { InterfaceRenderer } from '../../interface/renderer/InterfaceRenderer';
  import type { Node } from '../../interface/types/nodes';
  import type { Program } from '../../interface/types/program/program';
import { isPartOfMainGraph } from '../../interface/utils';

  import { buildProgramShader } from './../../shader/builder/programBuilder';
  import { shaderMaterial$ } from './../../stores/shaderStore';

  import NodeController from './nodes/NodeController.svelte';
  import NodeList from './nodes/NodeList.svelte';

  let program: Program;
  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  let activeNode: Node | undefined;

  const handleResize = () => {
    interfaceRenderer.resize();
    interfaceRenderer.render();
  };

  const onCanvasMount = (canvas: HTMLCanvasElement) => {
    program = createDefaultProgram();
    interfaceRenderer = new InterfaceRenderer(program, canvas);
    interfaceController = new InterfaceController(program, canvas);

    // Keyboard shortcuts

    // Resize
    // TODO throttle but emit last value
    fromEvent(window, 'resize')
    // .pipe(debounce(() => interval(100)))
      .subscribe(() => handleResize());

    // For some reason, the resize does not work properly unless done in the next event loop cycle.
    // The caclulated cursor position becomes slightly offset, 
    // and the "bottom" of the canvas does not receive the correct value.
    setTimeout(
      () => handleResize(),
      0
    );

    // Update
    interfaceController.on('nodeChange', () => {
      activeNode = activeNode; // NOTE: re-renders entire interface on each node change. Might not be necessary?
      interfaceRenderer.render();

      console.log('Node change!');
    });

    interfaceController.on('viewChange', () => interfaceRenderer.render());

    interfaceController.on('activateNode', ({ node }) => {
      activeNode = node;
      interfaceRenderer.orderNodes();
    });

    interfaceController.on('deactivateNode', () => {
      activeNode = undefined;
    });

    interfaceController.on('addNodes', () => {
      interfaceRenderer.orderNodes();
      interfaceRenderer.render();
    });

    interfaceController.on('deleteNodes', ({ nodes, needsRecompile }) => {
      if(activeNode && nodes.includes(activeNode)) {
        activeNode = undefined;
      }
      interfaceRenderer.orderNodes();
      interfaceRenderer.render();

      if(needsRecompile) updateShader();
    });

    const updateShader = () => {
      const shader = buildProgramShader(program);
      console.log(shader.fragmentShader);
      shaderMaterial$.set(
        new THREE.ShaderMaterial(shader)
      );
    };

    updateShader();
    /*
      'connectNodes': { node: Node, field: Field, source: Node },
      'disconnectNodes': { node: Node, connections: Connection[] },
    */

    interfaceController.on('connectNodes', ({ node }) => {
      if(isPartOfMainGraph(node, program)) {
        updateShader();
      }
    });


    interfaceController.on('disconnectNodes', ({ connections }) => {
      if(connections.some(({ node }) => isPartOfMainGraph(node, program))) {
        updateShader();
      }
    });

    // interfaceController.on('programChange', updateShader);
  };

  const onChange = () => {
    interfaceRenderer.render();
  };

  const onListClick = (nodeName: NodeKey, event: MouseEvent) => {
    // interfaceController.addNode(
    interfaceController.addUnplacedNode(
      nodeName, event.clientX - 100, event.clientY
    );
  };
</script>

<canvas use:onCanvasMount />

<div class="ui">
  { #if activeNode }
    <NodeController
      node={activeNode} 
      onChange={onChange}
    />
  {/if }

  <div></div>

  <NodeList 
    onClick={onListClick}
  />
</div>

<style>
  .ui {
    position: relative;
    pointer-events: none;
    background-color: #00000000;
    z-index: 2;

    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Prevents ui items from stretching */
  }

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
</style>
