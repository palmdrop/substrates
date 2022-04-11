import { writable } from 'svelte/store';
import { Shader } from '../shader/types/core';

export const shaderMaterial$ = writable<Shader | undefined>(undefined);