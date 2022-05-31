import pick from 'lodash.pick';
import { writable } from 'svelte/store';

import { ShaderNode } from '../interface/program/nodes';
import { isNode } from '../interface/program/utils';
import { Field } from '../interface/types/nodes';
import type { Program } from '../interface/types/program/program';
import { GlslVariable } from '../shader/types/core';
import { shaderMaterial$ } from './shaderStore';

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
const programStore$ = writable<Program>();
const programHistoryStore$ = writable<ProgramStore>();

export const subscribeToProgram = (subscriber: (program: Program) => void) => {
  return programStore$.subscribe(subscriber);
};

export const initializeProgramStore = (program: Program, shaderMaterial: THREE.ShaderMaterial) => {
  programStore$.set(program);
  programHistoryStore$.set({
    program, 
    history: Array<ProgramStore['history'][number]>(2).fill({ 
      encodedProgram: encodeProgram(program), 
      shaderMaterial
    }), // Duplicate first entry is a bit ugly, but it makes the logic simpler
  });
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
    Object.keys(node.fields).forEach(fieldName => {
      const field = node.fields[fieldName];
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

const decodeProgram = (programData: string) => {
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
        if((field.value as { nodeId: string }).nodeId) {
          const connectedNodeId = (field.value as { nodeId: string }).nodeId;
          const connectedNode = nodes[connectedNodeId] as ShaderNode;
          if(!connectedNode) throw new Error();

          field.value = connectedNode;
        }
      });
    });
  } catch(error) {
    return undefined;
  }

  const program: Program = {
    ...encodedProgram,
    rootNode: nodes[encodedProgram.rootId] as ShaderNode,
    nodes: Object.values(nodes) as ShaderNode[],
  };

  return program;
};

export const pushProgram = () => {
  shaderMaterial$.subscribe(material => {
    if(!material) return;
    programHistoryStore$.update(({ program, history }) => {
      if(!program) return { program, history };
      return {
        program,
        history: [...history, {
          encodedProgram: encodeProgram(program),
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
    return {
      program: previousProgram,
      history
    };
  });
};