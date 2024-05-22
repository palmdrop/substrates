import pick from 'lodash.pick';
import { writable } from 'svelte/store';
import * as THREE from 'three';

import { nodeCounter, nodeCreatorMap, NodeKey, ShaderNode } from '../interface/program/nodes';
import { isNode, setAllUniforms } from '../interface/program/utils';
import { Field, StaticField } from '../interface/types/nodes';
import type { Program } from '../interface/types/program/program';
import { loadTextureFieldFromDataURL, prepareTextureFieldForSerialization } from '../shader/builder/nodes/utils';
import { AdditionalData, buildProgramShader } from '../shader/builder/programBuilder';
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

export type EncodedProgram = Pick<Program, 'position' | 'zoom'> & {
  rootId: string,
  nodes: Record<string, EncodedNode>, 
}

// TODO: simplify, only one store should be necessary
export const programStore$ = writable<Program>();
export const programHistoryStore$ = writable<ProgramStore>();
export const additionalDataStore$ = writable<AdditionalData>({});

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

export const updateShaderMaterial = (program: Program, updateStore = true) => {
  const { shader, additionalData } = buildProgramShader(program);
  const material = new THREE.ShaderMaterial(shader);

  if(updateStore) {
    additionalDataStore$.set(additionalData);
    shaderMaterial$.set(material);
  }

  return material;
};

export const subscribeToProgram = (subscriber: (program: Program) => void) => {
  // TODO: for some reason is subscriber not notified when updating from loading certain programs
  programStore$.subscribe(subscriber);
};

export const initializeProgramStore = (program: Program) => {
  try {
    programStore$.set(program);
    const shaderMaterial = updateShaderMaterial(program);
    const encodedProgram = encodeProgram(program);
    programHistoryStore$.set({
      program, 
      history: Array<ProgramStore['history'][number]>(2).fill({ 
        encodedProgram,
        shaderMaterial
      }), // Duplicate first entry is a bit ugly, but it makes the logic simpler
    });

    updateLocalStorage(encodedProgram);

    // Make sure new nodes receive appropriate IDs
    nodeCounter.set(
      program.nodes.reduce((acc, node) => Math.max(Number.parseInt(node.id), acc), 0) + 1
    );
  } catch(error) {
    console.log(error);
  }
};

export const loadProgramFromString = async (programData: string) => {
  const program = await decodeProgram(programData);
  if(!program) throw new Error('Unable to load program...');
  initializeProgramStore(program);
  return program;
};

const prepareNode = (node: ShaderNode) => {
  const nodeCopy = JSON.parse(JSON.stringify(node)) as ShaderNode;
  if(node.type === 'image') {
    const sourceField = node.fields['source'] as StaticField<THREE.Texture | null>;
    nodeCopy.fields['source'] = prepareTextureFieldForSerialization(sourceField);
  }

  return nodeCopy;
};

export const encodeProgram = (program: Program) => {
  // JSON stringify will expand on all node connections, meaning there will be copies/duplicates of a lot of connected nodes
  // Therefore, we need to iterate over all the nodes in the copy and replace the links with a reference to the corresponding node ID
  // Then convert the data back to JSON

  const rootId = program.rootNode.id;

  // All copied nodes
  const nodes = new Map<string, ShaderNode | EncodedNode>();
  program.nodes.forEach(node => {
    nodes.set(node.id, prepareNode(node));
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

  const rootNode = nodes.get(rootId);
  delete rootNode?.fields['tDithering'];

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

export const decodeProgram = async (programData: string | EncodedProgram) => {
  const defaultNodeMap = new Map<NodeKey, ShaderNode>();

  let encodedProgram: EncodedProgram;
  if(typeof programData === 'string') {
    try {
      encodedProgram = JSON.parse(programData) as EncodedProgram;
    } catch (error) {
      return undefined;
    }
  } else {
    encodedProgram = programData;
  }

  if(!encodedProgram.rootId || !encodedProgram.nodes) return undefined;

  const nodes = encodedProgram.nodes as Record<string, EncodedNode | ShaderNode>;

  // Expand nodes
  try {
    for(const node of Object.values(nodes)) {
      for(const field of Object.values(node.fields) as (EncodedNode['fields']['string'] | Field)[]) {
        // If the node is dynamic and is connected to another node, replace nodeId with actual node
        if(field.value && (field.value as { nodeId: string }).nodeId) {
          const connectedNodeId = (field.value as { nodeId: string }).nodeId;
          const connectedNode = nodes[connectedNodeId] as ShaderNode;
          if(!connectedNode) throw new Error(connectedNodeId);

          field.value = connectedNode;
        } 
        // If node is an image node, reload the texture from image src
        else if(node.type === 'image' && node.fields['source'].value) {
          const sourceField = node.fields['source'] as StaticField<THREE.Texture>;
          if(sourceField.value.userData) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { name, data } = sourceField.value.userData as { name: string, data: string };

            if(name && data) {
              await loadTextureFieldFromDataURL(
                data, name, sourceField
              );
            }
          }
        }
      }

      if(!defaultNodeMap.has(node.type)) {
        defaultNodeMap.set(
          node.type,
          nodeCreatorMap[node.type](0, 0)
        );
      }

      const defaultNode = defaultNodeMap.get(node.type) as ShaderNode;

      (node.fields as ShaderNode['fields']) = {
        ...defaultNode.fields,
        ...node.fields,
      } as ShaderNode['fields'];
    }
  } catch(error) {
    console.error(error);
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

export const updateLocalStorage = (encodedProgram: string) => {
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

export const popProgram = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    programHistoryStore$.subscribe(({ program, history }) => {
      if(!history || history.length < 2) return { program, history };

      history.pop();

      const { encodedProgram, shaderMaterial } = history[history.length - 1];

      decodeProgram(encodedProgram)
        .then(previous => {
          const previousProgram = {
            ...previous,
            ...pick(program, 'zoom', 'position')
          } as Program;

          programStore$.set(previousProgram);
          shaderMaterial$.set(shaderMaterial);
          programHistoryStore$.set({
            program: previousProgram,
            history
          });

          setAllUniforms(previousProgram, shaderMaterial);
          updateLocalStorage(encodedProgram);
        
          resolve();
        })
        .catch((err) => reject(err));
    })();
  });
};