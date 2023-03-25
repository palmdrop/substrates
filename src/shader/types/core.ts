import * as THREE from 'three';


type AsArrayString<T> = T extends string ? `${T}[]` : never;
type AsVariableArrayString<T> = T extends string ? `${T}[${number}]` : never;

/* Basic types */
export type GLSL = string;
export type VariableName = string;
export type GlslRootType = 'float' | 'int' | 'bool' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D';
export type GlslArrayType = AsArrayString<GlslRootType>;
export type GlslVariableArrayType = AsVariableArrayString<GlslRootType>;
export type GlslType = GlslRootType | GlslArrayType;

export type Parameter = [ GlslRootType | GlslVariableArrayType, VariableName ];
export type GlslFunctionSignature = {
  parameters: Parameter[]
  returnType: GlslType,
}

export type ShaderChunk = {
  glsl: string,
  functionSignatures?: { [ key: string ]: GlslFunctionSignature }
}


/* Variables */
type IGlslVariable<T extends GlslType, V> = {
  type: T,
  value?: V
}

type WithArrayVariable<GV> = GV extends IGlslVariable<infer T, infer V> 
  ? (T extends GlslRootType
      ? (GV | IGlslVariable<`${T}[]`, V[]>) 
      : GV) 
  : never;
;

export type Float = IGlslVariable<'float', number>;
export type Int = IGlslVariable<'int', number>;
export type Bool = IGlslVariable<'bool', boolean>;
export type Vec2 = IGlslVariable<'vec2', THREE.Vector2>;
export type Vec3 = IGlslVariable<'vec3', THREE.Vector3>;
export type Vec4 = IGlslVariable<'vec4', THREE.Vector4>;
export type Sampler2D = IGlslVariable<'sampler2D', THREE.Texture | null>;
export type GlslVariable = WithArrayVariable<Float | Int | Bool | Vec2 | Vec3 | Vec4 | Sampler2D>;
export type GlslVariables = { [ name: string ]: GlslVariable };

/* Constants */
export type Constant = GlslVariable;
export type Constants = { [name: string]: GlslVariable };

/* Uniforms */
export type Uniform = THREE.IUniform & { 
  type: GlslRootType | GlslVariableArrayType,
  ignore?: boolean // Skip adding the uniform to the shader code automatically
}

export type Uniforms = { [ uniform: string ]: Uniform };

/* Attributes */
export type Attribute = {
  type: GlslType 
}
export type Attributes = { [ varying: string ]: Attribute };

/* Imports */
export type Imports = ShaderChunk[];

/* Functions */
export type GlslFunctionSignatures = { [ name: string ]: GlslFunctionSignature };
export type GlslFunction = GlslFunctionSignature & {
  body: GLSL
}
export type GlslFunctions = { [ name: string ]: GlslFunction };

/* Shaders */
export type Shader = {
  uniforms: Uniforms,
  vertexShader: GLSL,
  fragmentShader: GLSL
}