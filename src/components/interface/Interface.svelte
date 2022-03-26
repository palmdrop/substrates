<script lang="ts">
  import { InterfaceController } from "../../interface/controller/InterfaceController";
  import { InterfaceRenderer } from "../../interface/renderer/InterfaceRenderer";
  import { fromEvent } from "rxjs";
  import { createDefaultProgram } from "../../interface/program/Program";
  import type { Program } from "../../interface/types/program";

  let program: Program;
  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  const handleResize = () => {
    interfaceRenderer.resize();
    interfaceRenderer.render();
  }

  const onCanvasMount = (canvas: HTMLCanvasElement) => {
    program = createDefaultProgram(canvas);
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
    /*
    interfaceController.onUpdate(
      () => interfaceRenderer.render()
    )
    */
    // interfaceController.on('')
    interfaceController.on('nodeChange', () => interfaceRenderer.render());
    interfaceController.on('viewChange', () => interfaceRenderer.render());

    interfaceController.on('activateNode', () => interfaceRenderer.orderNodes());
  }
</script>

<canvas use:onCanvasMount />

<style>
  canvas {
    width: 100%;
    height: 100%;

    z-index: 100;
  }
</style>
