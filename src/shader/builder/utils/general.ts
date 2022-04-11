import { ShaderNode } from '../../../interface/program/nodes';
import { isShaderNode } from '../../../interface/program/utils';
import { Field } from '../../../interface/types/nodes';
import { Program } from '../../../interface/types/program/program';

export const validateProgram = (program: Program) => {
  const visited = new Set<ShaderNode>();
  const toVisit: ShaderNode[] = [];

  toVisit.push(program.rootNode);

  while(toVisit.length) {
    const current = toVisit.pop() as ShaderNode;

    if(visited.has(current) || !isShaderNode(current)) return false;
    visited.add(current);

    Object.values(current.fields).forEach((field: Field) => {
      if(isShaderNode(field.value)) {
        toVisit.push(field.value);
      }
    });
  }
};

export const iterateDepthFirst = (node: ShaderNode, callback: (node: ShaderNode) => void) => {
  // NOTE: assumes there are no loops...?
  Object.values(node.fields).forEach((field: Field) => {
    if(isShaderNode(field.value)) {
      iterateDepthFirst(field.value, callback);
    }
  });

  callback(node);
};