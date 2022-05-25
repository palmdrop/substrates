import { writable } from 'svelte/store';

import type { Program } from '../interface/types/program/program';

type ProgramStore = {
  program: Program | undefined,
  history: Program[]
};

export const programHistoryStore$ = writable<ProgramStore>({
  program: undefined,
  history: []
});

export const pushProgram = () => {
  programHistoryStore$.update(({ program, history }) => {
    if(!program) return { program, history };
    return {
      program,
      history: [...history, JSON.parse(JSON.stringify(program)) as Program]
    };
  });
};
