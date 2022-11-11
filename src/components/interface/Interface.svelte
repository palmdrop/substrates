<script lang="ts">
  import { fromEvent } from 'rxjs';

  import { fitProgram, InterfaceController } from '../../interface/controller/InterfaceController';
  import { NodeKey } from '../../interface/program/nodes';
  import { createDefaultProgram } from '../../interface/program/Program';
  import { InterfaceRenderer } from '../../interface/renderer/InterfaceRenderer';
  import type { Node } from '../../interface/types/nodes';
  import type { Program } from '../../interface/types/program/program';
  import { isPartOfMainGraph } from '../../interface/utils';
  import { exportProgram } from '../../shader/tools/export';
  import { encodeProgram, loadProgramFromString, pushProgram, setProgram, updateShaderMaterial } from '../../stores/programStore';
  import { substrateScene$ } from '../../stores/sceneStore';
  import { promptDownload } from '../../utils/general';

  import Header from './header/Header.svelte';
  import NodeController from './nodes/NodeController.svelte';
  import NodeList from './nodes/NodeList.svelte';

  export let program: Program;
  export let canvas: HTMLCanvasElement | undefined = undefined;

  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  let activeNode: Node | undefined;
  let programVisible = true;

  let firstProgramInitialized = false;

  const handleResize = () => {
    interfaceRenderer.resize();
    interfaceRenderer.render();
  };

  const handleSave = () => {
    promptDownload(
      'data:text/json;charset=utf-8,' + encodeURIComponent(encodeProgram(program)),
      'program.json'
    );
  };

  const handleLoad = (encodedProgram: string) => {
    loadProgramFromString(encodedProgram).catch(
      error => console.error(error)
    );
  };

  const handleCapture = () => {
    $substrateScene$?.captureFrame(data => {
      promptDownload(data, 'substrate.png');
    });
  };

  const handleReset = () => {
    setProgram(createDefaultProgram());
  };

  const handleExport = () => {
    exportProgram({
      embedUniforms: false,
      includeImages: true,
      includeReadme: true
    }).then(
      exportData => {
        promptDownload(
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData)),
          'export.json'
        );
      }
    ).catch(error => {
      console.error(error);
    });
  };

  const handleToggleVisible = () => {
    interfaceController?.toggleVisible();
  };

  $: {
    if(interfaceController) interfaceController.dispose();
    if(canvas && program) {
      setup(canvas);
      if(!firstProgramInitialized) {
        fitProgram(program, canvas);
        firstProgramInitialized = true;
      }
    }
  }

  const setup = (canvas: HTMLCanvasElement) => {
    activeNode = undefined;
    programVisible = true;
    interfaceRenderer = new InterfaceRenderer(program, canvas);
    interfaceController = new InterfaceController(program, canvas);

    // Keyboard shortcuts

    // Resize
    // TODO throttle but emit last value
    fromEvent(window, 'resize')
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
      interfaceRenderer.render(); // TODO: optimize by making sure only re-rendering ONCE per loop
    });

    interfaceController.on('viewChange', () => {
      interfaceRenderer.render();
    });

    interfaceController.on('visibilityChange', () => {
      interfaceRenderer.render();
      programVisible = !program.hidden;
    });

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
      updateShaderMaterial(program);
    };

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

    interfaceController.on('captureRequested', () => handleCapture());
    interfaceController.on('saveRequested', () => handleSave());

    // Callback for undo
    interfaceController.setCallbackIncludeEvents([
      'addNodes',
      'connectNodes',
      'deleteNodes',
      'disconnectNodes',
      'droppedNodes',
    ]);

    interfaceController.setCallback(() => {
      pushProgram();
    });
  };

  const onListClick = (nodeName: NodeKey, event: MouseEvent) => {
    interfaceController.addUnplacedNode(
      nodeName, event.clientX - 100, event.clientY
    );
  };
</script>

<div class="ui">
  <Header 
    onLoad={handleLoad}
    onSave={handleSave}
    onCapture={handleCapture}
    onReset={handleReset}
    onExport={handleExport}
    programVisible={programVisible}
    onToggleVisible={handleToggleVisible}
  />
  <div class='node-controllers'>
    <NodeController
      node={activeNode ?? program.rootNode} 
      onChangeCommited={() => pushProgram()}
    />

    <NodeList 
      onClick={onListClick}
    />
  </div>
</div>

<style>
  .ui {
    position: relative;
    pointer-events: none;
    background-color: transparent;
    z-index: 2;

    height: 100vh;
  }
  
  .node-controllers {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    height: 100%;
  }
</style>
