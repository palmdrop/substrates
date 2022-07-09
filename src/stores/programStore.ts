import pick from 'lodash.pick';
import { writable } from 'svelte/store';
import * as THREE from 'three';

import { nodeCounter, ShaderNode } from '../interface/program/nodes';
import { isNode, setAllUniforms } from '../interface/program/utils';
import { Field } from '../interface/types/nodes';
import type { Program } from '../interface/types/program/program';
import { buildProgramShader } from '../shader/builder/programBuilder';
import { GlslVariable } from '../shader/types/core';
import { shaderMaterial$ } from './shaderStore';

export const PROGRAM_STORAGE_KEY = 'program';

type ProgramStore = {
  program: Program | undefined,
  history: { encodedProgram: string, shaderMaterial: THREE.ShaderMaterial }[] // Encoded programs
};

type EncodedNode = Omit<ShaderNode, 'fields'> & {
  fields: { 
    [name: string]: Omit<Field, 'value'> & {
      value: GlslVariable | { nodeId: string }
    }
  }
}

type EncodedProgram = Pick<Program, 'position' | 'zoom'> & {
  rootId: string,
  nodes: Record<string, EncodedNode>, 
}

// TODO: simplify, only one store should be necessary
export const programStore$ = writable<Program>();
export const programHistoryStore$ = writable<ProgramStore>();

export const setProgram = (program: Program) => {
  programStore$.set(program);
  programHistoryStore$.update(({ history }) => {
    return {
      program,
      history
    };
  });
  updateShaderMaterial(program);
  pushProgram();
};

const updateShaderMaterial = (program: Program) => {
  const shader = buildProgramShader(program);
  const material = new THREE.ShaderMaterial(shader);
  shaderMaterial$.set(material);
  return material;
};

export const subscribeToProgram = (subscriber: (program: Program) => void) => {
  // TODO: for some reason is subscriber not notified when updating from loading certain programs
  programStore$.subscribe(subscriber);
};

export const initializeProgramStore = (program: Program) => {
  try {
    programStore$.set(program);
    const material = updateShaderMaterial(program);
    programHistoryStore$.set({
      program, 
      history: Array<ProgramStore['history'][number]>(2).fill({ 
        encodedProgram: encodeProgram(program), 
        shaderMaterial: material
      }), // Duplicate first entry is a bit ugly, but it makes the logic simpler
    });

    // Make sure new nodes receive appropriate IDs
    nodeCounter.set(
      program.nodes.reduce((acc, node) => Math.max(Number.parseInt(node.id), acc), 0) + 1
    );
  } catch(error) {
    console.log(error);
  }
};

export const loadProgramFromString = (programData: string) => {
  try {
    const program = decodeProgram(programData);
    if(!program) return undefined;
    initializeProgramStore(program);
    return program;
  } catch(err) {
    return undefined;
  }
};

export const encodeProgram = (program: Program) => {
  // JSON stringify will expand on all node connections, meaning there will be copies/duplicates of a lot of connected nodes
  // Therefore, we need to iterate over all the nodes in the copy and replace the links with a reference to the corresponding node ID
  // Then convert the data back to JSON

  const rootId = program.rootNode.id;

  // All copied nodes
  const nodes = new Map<string, ShaderNode | EncodedNode>();
  program.nodes.forEach(node => {
    nodes.set(node.id, JSON.parse(JSON.stringify(node)) as ShaderNode);
  });

  // Replace references with IDs
  for(const node of nodes.values()) {
    if(node.anchor) {
      node.anchor.active = false;
      node.anchor.hovered = false;
    }

    Object.values(node.fields).forEach((field: typeof node.fields[number]) => {
      field.anchor.active = false;
      field.anchor.hovered = false;
      if(isNode(field.value)) {
        field.value = { nodeId: field.value.id };
      }
    });
  }

  const json = JSON.stringify({
    rootId,
    nodes: Object.fromEntries(nodes.entries()),
    ...pick(
      program, [
        'position',
        'zoom'
      ]
    ),
  }, null, 2);

  return json;
};

export const decodeProgram = (programData: string) => {
  let encodedProgram: EncodedProgram;
  try {
    encodedProgram = JSON.parse(programData) as EncodedProgram;
  } catch (error) {
    return undefined;
  }

  if(!encodedProgram.rootId || !encodedProgram.nodes) return undefined;

  const nodes = encodedProgram.nodes as Record<string, EncodedNode | ShaderNode>;

  // Expand nodes
  try {
    Object.values(nodes).forEach(node => {
      Object.values(node.fields).forEach((field: EncodedNode['fields']['string'] | Field) => {
        if(field.value && (field.value as { nodeId: string }).nodeId) {
          const connectedNodeId = (field.value as { nodeId: string }).nodeId;
          const connectedNode = nodes[connectedNodeId] as ShaderNode;
          if(!connectedNode) throw new Error(connectedNodeId);

          field.value = connectedNode;
        }
      });
    });
  } catch(error) {
    return undefined;
  }

  const program: Program = {
    openConnection: undefined,
    position: encodedProgram.position,
    zoom: encodedProgram.zoom,
    rootNode: nodes[encodedProgram.rootId] as ShaderNode,
    nodes: Object.values(nodes) as ShaderNode[],
  };

  return program;
};

const updateLocalStorage = (encodedProgram: string) => {
  localStorage.setItem(PROGRAM_STORAGE_KEY, encodedProgram);
};

export const pushProgram = () => {
  shaderMaterial$.subscribe(material => {
    if(!material) return;
    programHistoryStore$.update(({ program, history }) => {
      if(!program) return { program, history };
      const encodedProgram = encodeProgram(program);
      updateLocalStorage(encodedProgram);

      return {
        program,
        history: [...history, {
          encodedProgram,
          shaderMaterial: material
        }],
      };
    });
  })();
};

export const popProgram = () => {
  programHistoryStore$.update(({ program, history }) => {
    if(!history || history.length < 2) return { program, history };

    history.pop();

    const { encodedProgram, shaderMaterial } = history[history.length - 1];
    const previousProgram = {
      ...decodeProgram(encodedProgram),
      ...pick(program, 'zoom', 'position')
    } as Program;

    programStore$.set(previousProgram);
    shaderMaterial$.set(shaderMaterial);

    setAllUniforms(previousProgram, shaderMaterial);
    updateLocalStorage(encodedProgram);

    return {
      program: previousProgram,
      history
    };
  });
};