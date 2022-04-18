import { writable } from 'svelte/store';

import { SubstrateScene } from '../substrate/SubstrateScene';

export const substrateScene$ = writable<SubstrateScene | undefined>(undefined);