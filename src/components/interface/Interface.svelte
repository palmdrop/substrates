<script lang="ts">
  import { fromEvent } from 'rxjs';
  import * as THREE from 'three';

  import { fitProgram, InterfaceController } from '../../interface/controller/InterfaceController';
  import { NodeKey } from '../../interface/program/nodes';
  import { createDefaultProgram } from '../../interface/program/Program';
  import { InterfaceRenderer } from '../../interface/renderer/InterfaceRenderer';
  import type { Node } from '../../interface/types/nodes';
  import type { Program } from '../../interface/types/program/program';
  import { isPartOfMainGraph } from '../../interface/utils';
  import { encodeProgram, loadProgramFromString, pushProgram, setProgram } from '../../stores/programStore';
  import { substrateScene$ } from '../../stores/sceneStore';
  import { promptDownload } from '../../utils/general';

  import { buildProgramShader } from './../../shader/builder/programBuilder';
  import { shaderMaterial$ } from './../../stores/shaderStore';

  import Header from './header/Header.svelte';
  import NodeController from './nodes/NodeController.svelte';
  import NodeList from './nodes/NodeList.svelte';

  export let program: Program;
  export let canvas: HTMLCanvasElement | undefined = undefined;

  let interfaceRenderer: InterfaceRenderer;
  let interfaceController: InterfaceController;

  let activeNode: Node | undefined;
  let uiVisible = true;

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
    loadProgramFromString(encodedProgram);
  };

  const handleCapture = () => {
    $substrateScene$?.captureFrame(data => {
      promptDownload(data, 'substrate.png');
    });
  };

  const handleReset = () => {
    setProgram(createDefaultProgram());
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
    uiVisible = false;

    uiVisible = true;
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
      uiVisible = !program.hidden;
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
      const shader = buildProgramShader(program);
      shaderMaterial$.set(
        new THREE.ShaderMaterial(shader)
      );
    };

    // updateShader();

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

  const onChange = () => {
    // no need to re-render interface on uniform change anymore
    // interfaceRenderer.render();
  };

  const onListClick = (nodeName: NodeKey, event: MouseEvent) => {
    interfaceController.addUnplacedNode(
      nodeName, event.clientX - 100, event.clientY
    );
  };
</script>

{ #if uiVisible }
  <div class="ui">
    <Header 
      onLoad={handleLoad}
      onSave={handleSave}
      onCapture={handleCapture}
      onReset={handleReset}
    />
    <div class='node-controllers'>
      { #if activeNode }
        <NodeController
          node={activeNode} 
          onChange={onChange}
          onChangeCommited={() => pushProgram()}
        />
      {/if }

      <div />

      <NodeList 
        onClick={onListClick}
      />
    </div>
  </div>
{ /if }

<style>
  .ui {
    position: relative;
    pointer-events: none;
    background-color: #00000000;
    z-index: 2;
  }
  
  .node-controllers {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Prevents ui items from stretching */
  }
</style>
