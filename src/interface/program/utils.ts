/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as THREE from 'three';

import { getUniformName } from '../../shader/builder/utils/shader';
import { setUniform } from '../../utils/shader';
import type { Field, Fields, Node } from '../types/nodes';
import { Program } from '../types/program/program';
import { nodeCounter, nodeKeys,ShaderNode } from './nodes';

export const isNode = (node: any): node is Node => {
  return (
    typeof node === 'object' &&
    typeof node.type === 'string' &&
    typeof node.fields === 'object'
  );
};

export const isShaderNode = (node: any): node is ShaderNode => {
  return (
    isNode(node) &&
    Array.prototype.includes.call(nodeKeys, node.type) // NOTE: to avoid typing issues...
  );
};

export const duplicateNode = (node: ShaderNode): ShaderNode => {
  const duplicate = {
    ...node,
    anchor: node.anchor ? {
      ...node.anchor
    } : undefined,
    id: node.id + '_' + nodeCounter.next(),
    fields: (Object.entries(node.fields) as [string, Field][]).reduce((acc, [name, field]) => {
      acc[name] = {
        ...field,
        anchor: {
          ...field.anchor
        }
      };
      return acc;
    }, {} as Fields)
  };

  return duplicate;
};

export const setAllUniforms = (program: Program, shaderMaterial: THREE.ShaderMaterial) => {
  program.nodes.forEach(node => {
    Object.keys(node.fields).forEach(fieldName => {
      const field = node.fields[fieldName];
      if(!isNode(field.value) && !field.internal) {
        const uniformName = getUniformName(node, fieldName) ;
        setUniform(
          uniformName,
          field.value,
          shaderMaterial
        );
      }
    });
  });
};