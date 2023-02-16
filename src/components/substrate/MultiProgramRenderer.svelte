<script lang="ts">
  import { Subscription } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  import type * as THREE from 'three';
  import type { Program } from '../../interface/types/program/program';
  import { decodeProgram, type EncodedProgram, updateShaderMaterial } from '../../stores/programStore';
  import { SubstrateScene } from '../../substrate/SubstrateScene';
  import { setUniform } from '../../utils/shader';

  export let programsData: EncodedProgram[];
  export let animate: boolean | number = true;
  export let uniformOverrides: { [uniformName: string]: any } = {};
  export let scale: number | ((currentScale: number) => void) | undefined = undefined;
  export let style: string | undefined = undefined;
  export let index: number;

  export let active: boolean = !!animate;
  $: {
    active = !!animate;
  }

  let substrateScene: SubstrateScene;

  let shaderMaterials: THREE.ShaderMaterial[];
  let additionalMaterialsData: { feedbackTextureUniforms: string[] }[];
  let programs: Program[];

  let currentShaderMaterial: THREE.ShaderMaterial;
  let currentProgram: Program;

  let resizeSubscription: Subscription;

  let parent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const onParentMount = (parentElement: HTMLDivElement) => {
    parent = parentElement;
  };

  const onCanvasMount = (canvasElement: HTMLCanvasElement) => {
    canvas = canvasElement;
  };

  const setupSubstrateScene = (decodedPrograms: Program[]) => {
    programs = decodedPrograms;
    substrateScene = new SubstrateScene(canvas);

    shaderMaterials = programs.map(program => updateShaderMaterial(program, false));
    additionalMaterialsData = shaderMaterials.map(shaderMaterial => {
      const feedbackTextureUniforms = Object.keys(shaderMaterial.uniforms).filter(uniformName => uniformName.startsWith('uTFeedback'));
      return { feedbackTextureUniforms };
    });

    substrateScene.resize(parent.clientWidth, parent.clientHeight);
  }

  $: {
    if(shaderMaterials && programs && index > 0) {
      const currentTime = currentShaderMaterial?.uniforms?.time?.value ?? 0

      currentShaderMaterial = shaderMaterials[index];
      currentProgram = programs[index];

      if(currentShaderMaterial && currentProgram) {
        currentShaderMaterial.uniforms.time.value = currentTime;
        substrateScene.setShaderMaterial(currentShaderMaterial, currentProgram, additionalMaterialsData[index]);
      }
    }
  }

  let initialScale: number | undefined = undefined;
  $: {
    if(currentShaderMaterial) {
      Object
        .keys(uniformOverrides)
        .forEach(
          uniformName => setUniform(uniformName, uniformOverrides[uniformName], currentShaderMaterial)
        );

      if(typeof uniformOverrides.time !== 'undefined') {
        substrateScene.setTime(uniformOverrides.time)
      }

      if(typeof uniformOverrides.timeScale !== 'undefined') {
        substrateScene.setTimeScale(uniformOverrides.timeScale)
      }

      if(typeof scale !== 'undefined') {
        const scaleUniformName = Object.keys(currentShaderMaterial.uniforms).find(key => key.includes('uScale_'));

        if(scaleUniformName) {
          if(typeof initialScale === "undefined") {
            initialScale = currentShaderMaterial.uniforms[scaleUniformName].value as number;
          }

          const scaleValue = typeof scale === 'number'
            ? scale
            : scale(initialScale);

          setUniform(scaleUniformName, scaleValue, currentShaderMaterial);
        }
      }
    }
  }

  $: {
    if(substrateScene) {
      if(animate) {
        if(typeof animate === "number") {
          const initialFrame = substrateScene.getFrame();
          substrateScene.start(
            () => {
              const currentFrame = substrateScene.getFrame();
              if(currentFrame - initialFrame > animate) {
                active = false;
                substrateScene.stop();
              }
            }
          );
        } else {
          substrateScene.start();
        }
      } else {
        substrateScene.stop();
        substrateScene.update();
        substrateScene.render();
        substrateScene.render();
      }
    }
  }

  onMount(() => {
    Promise.all(programsData.map(programData => decodeProgram(programData)))
      .then(decodedPrograms => {
        // TODO: warning if some programs didn't compile?
        const programs = decodedPrograms.filter(Boolean) as Program[];

        if(!programs) throw new Error('Programs did not compile');
        setupSubstrateScene(programs);

        new ResizeObserver(() => {
          substrateScene?.resize(parent.clientWidth, parent.clientHeight);
          if(!animate) {
            setTimeout(() => {
              substrateScene.update();
              substrateScene.render();
              substrateScene.render();
            }, 0);
          }
        }).observe(parent);

        substrateScene?.resize(parent.clientWidth, parent.clientHeight);
      });
  });

  onDestroy(() => {
    substrateScene?.stop();
    resizeSubscription?.unsubscribe();
  });
</script>

<div 
  use:onParentMount
  class="canvas-container"
  { style }
>
  <canvas 
    use:onCanvasMount
  />
</div>

<style>
  .canvas-container {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
  }

  canvas {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
  }
</style>