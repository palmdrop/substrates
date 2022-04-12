import * as THREE from 'three';

import { setUniform } from '../utils/shader';

export class SubstrateScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private plane: THREE.Mesh;

  private defaultMaterial: THREE.MeshBasicMaterial;
  private shaderMaterial?: THREE.ShaderMaterial;

  private running: boolean;
  private time: number;
  private animationFrameId: number;

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

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('black');

    this.camera = new THREE.OrthographicCamera(
      -0.5, 0.5,
      0.5, -0.5,
      0, 1000
    );

    this.defaultMaterial = new THREE.MeshBasicMaterial({
      color: 'black'
    });

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1.0, 1.0),
      this.defaultMaterial
    );

    this.scene.add(this.plane);

    this.resize();
  }

  setShaderMaterial(shaderMaterial: THREE.ShaderMaterial | undefined) {
    if(!shaderMaterial) {
      this.plane.material = this.defaultMaterial;
      this.shaderMaterial = undefined;
    } else {
      this.shaderMaterial = shaderMaterial;
      this.plane.material = this.shaderMaterial;
    }
  }

  render() {
    this.renderer.render(
      this.scene,
      this.camera
    );


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

      this.render();
      this.update();
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.running = false;
  }

  resize() {
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
}