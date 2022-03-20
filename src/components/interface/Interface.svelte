<script lang="ts">
  import { InterfaceController } from "../../interface/controller/InterfaceController";
  import { InterfaceRenderer } from "../../interface/renderer/InterfaceRenderer";
  import { fromEvent, debounce, interval } from "rxjs";
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
    handleResize();
    fromEvent(window, 'resize')
      .pipe(debounce(() => interval(100)))
      .subscribe(() => handleResize())

    // Update
    interfaceController.onUpdate(
      () => interfaceRenderer.render()
    )
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
