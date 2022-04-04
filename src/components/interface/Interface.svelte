<script lang="ts">
  import { InterfaceController } from "../../interface/controller/InterfaceController";
  import { InterfaceRenderer } from "../../interface/renderer/InterfaceRenderer";
  import { fromEvent } from "rxjs";
  import { createDefaultProgram } from "../../interface/program/Program";
  import type { Program } from "../../interface/types/program";
  import type { TypedNode } from "../../interface/program/nodes";
  import type { Node } from "../../interface/types/nodes";
  import NodeController from "./NodeController.svelte";

  let program: Program<TypedNode>;
  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  let activeNode: Node | undefined;

  const handleResize = () => {
    interfaceRenderer.resize();
    interfaceRenderer.render();
  }

  const onCanvasMount = (canvas: HTMLCanvasElement) => {
    program = createDefaultProgram();
    interfaceRenderer = new InterfaceRenderer(program, canvas);
    interfaceController = new InterfaceController(program, canvas);

    // Resize
    // TODO throttle but emit last value
    fromEvent(window, 'resize')
      // .pipe(debounce(() => interval(100)))
      .subscribe(() => handleResize())

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
      interfaceRenderer.render()
    });
    interfaceController.on('viewChange', () => interfaceRenderer.render());

    interfaceController.on('activateNode', ({ node }) => {
      activeNode = node;
      interfaceRenderer.orderNodes()
    });

    interfaceController.on('deactivateNode', () => {
      activeNode = undefined;
    });
  }

  const onChange = () => {
    interfaceRenderer.render();
  }
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
  }

  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;

  }
</style>
