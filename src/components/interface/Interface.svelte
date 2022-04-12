<script lang="ts">
  import { fromEvent } from 'rxjs';
  import * as THREE from 'three';

  import { InterfaceController } from '../../interface/controller/InterfaceController';
  import { NodeKey } from '../../interface/program/nodes';
  import { createDefaultProgram } from '../../interface/program/Program';
  import { InterfaceRenderer } from '../../interface/renderer/InterfaceRenderer';
  import type { Node } from '../../interface/types/nodes';
  import type { Program } from '../../interface/types/program/program';

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
    });

    interfaceController.on('viewChange', () => interfaceRenderer.render());

    interfaceController.on('activateNode', ({ node }) => {
      activeNode = node;
      interfaceRenderer.orderNodes();
    });

    interfaceController.on('deactivateNode', () => {
      activeNode = undefined;
    });

    const updateShader = () => {
      shaderMaterial$.set(
        new THREE.ShaderMaterial(buildProgramShader(program))
      );
    };

    updateShader();

    interfaceController.on('connectNodes', updateShader);
    interfaceController.on('disconnectNodes', updateShader);
  };

  const onChange = () => {
    interfaceRenderer.render();
  };

  const onListClick = (nodeName: NodeKey, event: MouseEvent) => {
    interfaceController.spawnNode(
      nodeName, event.clientX - 100, event.clientY
    );

    onChange();
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
  }

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
</style>
