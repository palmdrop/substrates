<script lang="ts">
  import { InterfaceController } from "../../interface/controller/InterfaceController";
  import { InterfaceRenderer } from "../../interface/renderer/InterfaceRenderer";
  import { fromEvent } from "rxjs";
  import { createDefaultProgram } from "../../interface/program/Program";

  let program = createDefaultProgram();
  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  const handleResize = () => {
    interfaceRenderer.resize();
    interfaceRenderer.render();
  }

  const onCanvasMount = (canvas: HTMLCanvasElement) => {
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
    interfaceController.on('activateNode', () => interfaceRenderer.render());
    interfaceController.on('grabbedNodes', () => interfaceRenderer.render());
    interfaceController.on('hoverNode', () => interfaceRenderer.render());
    interfaceController.on('releasedNodes', () => interfaceRenderer.render());
    interfaceController.on('selectNodes', () => interfaceRenderer.render());
    interfaceController.on('translateNodes', () => interfaceRenderer.render());
    interfaceController.on('zoomView', () => interfaceRenderer.render());
    interfaceController.on('moveView', () => interfaceRenderer.render());
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
