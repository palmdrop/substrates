import * as THREE from 'three';

import { Program } from '../interface/types/program/program';
import { AdditionalData } from '../shader/builder/programBuilder';
import { getUniformName } from '../shader/builder/utils/shader';
import { setUniform } from '../utils/shader';
import { createFeedbackPipeline } from './feedbackPipeline';

export class SubstrateScene {
  private renderer: THREE.WebGLRenderer;

  private shaderMaterial?: THREE.ShaderMaterial;
  private program?: Program;

  private feedbackPipeline: ReturnType<typeof createFeedbackPipeline>;
  private additionalData: AdditionalData = {};

  private running: boolean;
  private time: number;
  private animationFrameId: number;

  private captureNext = false;
  private dataCallback?: (data: string) => void;
  private initialScale = 1.0;

  private captureFrameResolutionMultiplier = 2.0;

  constructor(
    private canvas: HTMLCanvasElement,
  ) {
    this.running = false;
    this.time = 0.0;
    this.animationFrameId = -1;
  
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });

    this.renderer.setClearColor(new THREE.Color('black'), 0.0);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.feedbackPipeline = createFeedbackPipeline(this.renderer);
    this.resize();
  }

  setShaderMaterial(
    shaderMaterial: THREE.ShaderMaterial | undefined,
    program?: Program,
    additionalData?: AdditionalData
  ) {
    if(!shaderMaterial) {
      this.shaderMaterial = undefined;
      this.program = undefined;
    } else {
      this.shaderMaterial = shaderMaterial;
      this.program = program;

      this.feedbackPipeline.updateMaterial(shaderMaterial);

      this.resize();
    }

    this.additionalData = additionalData ?? {};
  }

  render() {
    this.feedbackPipeline.render(
      this.additionalData.feedbackTextureUniforms ?? []
    );
  }

  private adaptProgramScale = () => {
    if(!this.program) return;

    const scaleUniform = getUniformName(this.program.rootNode, 'scale');
    const current = this.program.rootNode.fields['scale'].value as number;

    this.initialScale = current;

    setUniform(
      scaleUniform, current / this.captureFrameResolutionMultiplier, this.shaderMaterial
    );
  };

  private restoreProgramScale = () => {
    if(!this.program) return;

    const scaleUniform = getUniformName(this.program.rootNode, 'scale');
    setUniform(
      scaleUniform, this.initialScale, this.shaderMaterial
    );
  };

  protected beforeRender(): void {
    if(this.captureNext && this.dataCallback && this.captureFrameResolutionMultiplier !== 1.0 && !this.additionalData.feedbackTextureUniforms?.length) {
      this.canvas.width *= this.captureFrameResolutionMultiplier;
      this.canvas.height *= this.captureFrameResolutionMultiplier;
      this.resize(this.canvas.width, this.canvas.height);

      this.adaptProgramScale();
    }
  }

  // TODO: change scale before and after capturing frame to make sure size is the same!
  protected afterRender(): void {
    if(this.captureNext && this.dataCallback) {
      this.dataCallback(this.canvas.toDataURL('image/url'));
      this.captureNext = false;

      if (this.captureFrameResolutionMultiplier !== 1.0 && !this.additionalData.feedbackTextureUniforms?.length) {
        this.canvas.width /= this.captureFrameResolutionMultiplier;
        this.canvas.height /= this.captureFrameResolutionMultiplier;
        this.resize(this.canvas.width, this.canvas.height);

        // TODO: not reset back for some reason...
        this.restoreProgramScale();
      }
    }
  }

  update() {
    if(this.shaderMaterial) {
      setUniform('time', this.time, this.shaderMaterial);
    }
  }

  start() {
    if(this.running) return;
    this.running = true;

    let then = 0.0;
    const animate = (now: number) => {
      now /= 1000;
      const delta = now - then;
      this.time += delta;
      then = now;

      this.animationFrameId = requestAnimationFrame(animate);

      this.beforeRender();
      this.render();
      this.afterRender();

      this.update();
    };

    animate(0);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.running = false;
  }

  resize(width?: number, height?: number) {
    width = width ?? window.innerWidth;
    height = height ?? window.innerHeight;

    // this.renderer.setSize(width, height);
    // this.composer.setSize(width, height);
    this.feedbackPipeline.setSize(width, height);

    const pixelRatio = window.devicePixelRatio;
    setUniform('viewport', new THREE.Vector2(width * pixelRatio, height * pixelRatio), this.shaderMaterial);
  }

  captureFrame(dataCallback: (data: string) => void) {
    this.captureNext = true;
    this.dataCallback = dataCallback;
  }
}