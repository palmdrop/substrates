<script lang="ts">
  import * as THREE from 'three';
import { shaderMaterial$ } from './../../stores/shaderStore';
import { buildProgramShader } from './../../shader/builder/programBuilder';
import { InterfaceController } from '../../interface/controller/InterfaceController';
import { InterfaceRenderer } from '../../interface/renderer/InterfaceRenderer';
import { fromEvent } from 'rxjs';
import { createDefaultProgram } from '../../interface/program/Program';
import type { Program } from '../../interface/types/program/program';
import type { Node } from '../../interface/types/nodes';
import NodeController from './NodeController.svelte';

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

    interfaceController.on('connectNodes', updateShader);
    interfaceController.on('disconnectNodes', updateShader);
};

const onChange = (value: any) => {
    interfaceRenderer.render();
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
</div>

<style>
  .ui {
    position: relative;
    pointer-events: none;
    background-color: #00000000;
    z-index: 2;
  }

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
</style>
