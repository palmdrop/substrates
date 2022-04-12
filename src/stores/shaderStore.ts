import { writable } from 'svelte/store';
import * as THREE from 'three';

export const shaderMaterial$ = writable<THREE.ShaderMaterial | undefined>(undefined);