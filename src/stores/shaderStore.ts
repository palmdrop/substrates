import { writable } from 'svelte/store';
import * as THREE from 'three';

export const shaderMaterial$ = writable<THREE.ShaderMaterial | undefined>(undefined);

// Useful for setting uniforms on additional materials sourced from the same program
export const additionalShaderMaterials$ = writable<THREE.ShaderMaterial[]>([]);