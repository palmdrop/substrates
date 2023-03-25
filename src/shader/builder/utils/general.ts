import { ShaderNode } from '../../../interface/program/nodes';
import { isShaderNode } from '../../../interface/program/utils';
import { Field, Node } from '../../../interface/types/nodes';
import { Program } from '../../../interface/types/program/program';
import { GlslArrayType, GlslRootType, GlslType, GlslVariableArrayType } from '../../types/core';

export const isNodePartOfCycle = (
  node: Node, 
  visited: Set<Node> = new Set<Node>(),
  recStack: Set<Node> = new Set<Node>()
): boolean => {
  if(!visited.has(node)) {
    visited.add(node);
    recStack.add(node);

    const childNodes = Object.values(node.fields)
      .filter((field: Field) => isShaderNode(field.value))
      .map(field => field.value as ShaderNode);

    for(let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if(
        (!visited.has(child) && isNodePartOfCycle(child, visited, recStack)) ||
        recStack.has(child)
      ) {
        return true;
      }
    }
  }

  recStack.delete(node);
  return false;
};

export const detectCycle = (
  program: Program
): boolean => {
  const visited = new Set<ShaderNode>();
  const recStack = new Set<ShaderNode>();

  for(let i = 0; i < program.nodes.length; i++) {
    const current = program.nodes[i];
    if(isNodePartOfCycle(current, visited, recStack)) {
      return true;
    }
  }

  return false;
};

export const validateProgram = (program: Program) => {
  return detectCycle(program);
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

const arrayTypeRegex = /\w+\[\]/g;
export const isArrayType = (field: { type: GlslType }): field is { type: GlslArrayType } => {
  return !!field.type.match(arrayTypeRegex);
}

export const removeArrayType = (type: GlslArrayType | GlslVariableArrayType): GlslRootType => {
  const bracketIndex = type.lastIndexOf('[');
  return type.slice(0, bracketIndex) as GlslRootType;
}

export const getRootType = (type: GlslType): GlslRootType => {
  if(isArrayType({ type })) return removeArrayType(type as GlslArrayType);
  return type as GlslRootType;
}

export const getFieldValue = <T = unknown>(field: Field<T>) => {
  if(isArrayType(field)) {
    return (field.value as T[]).length === 0 
      ? field.defaultValue 
      : field.value
  } else {
    return field.value;
  }
}