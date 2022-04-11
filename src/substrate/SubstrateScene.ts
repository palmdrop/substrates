import * as THREE from 'three';
import { Shader } from '../shader/types/core';

export class SubstrateScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;

  constructor(
    private canvas: HTMLCanvasElement,
    // private shader: Shader
  ) {
  
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

    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1.0, 1.0),
      new THREE.MeshBasicMaterial({
        color: 'red'
      })
    );

    this.scene.add(plane);
  }

  render() {
    this.renderer.render(
      this.scene,
      this.camera
    );
  }

}