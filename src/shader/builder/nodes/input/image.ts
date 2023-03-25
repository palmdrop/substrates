import * as THREE from 'three';
import dedent from 'ts-dedent';
import { ShaderNode } from '../../../../interface/program/nodes';
import { Field, Node } from '../../../../interface/types/nodes';
import { shaderMaterial$ } from '../../../../stores/shaderStore';
import { setUniform } from '../../../../utils/shader';
import { getUniformName } from '../../utils/shader';

// NOTE: for some reason, the entire texture has to be recreated when wrapping is updated. Unclear why.
// NOTE: When image is selected, texture will be created TWICE. Fix this at some point.
const updateTextureEffect = (_: Field, node: Node) => {
  const texture = node.fields['source'].value as THREE.Texture;
  const wrap = node.fields['wrap'].value as number;
  const filtering = node.fields['filtering'].value as number;
  if(!texture) return;

  const newTexture = new THREE.Texture(texture.source.data);
  newTexture.wrapS = wrap;
  newTexture.wrapT = wrap;
  newTexture.magFilter = filtering;
  newTexture.minFilter = filtering;
  newTexture.name = texture.name;
  newTexture.needsUpdate = true;

  node.fields['source'].value = newTexture;

  shaderMaterial$.subscribe(material => {
    const uniformName = getUniformName(node as ShaderNode, 'source');
    setUniform(uniformName, node.fields['source'].value, material);
  })();
}

export const imageConfig = {
  name: 'image',
  returnType: 'vec3',
  group: 'input',
  fields: {
    'point': {
      kind: 'dynamic',
      type: 'vec3',
      value: new THREE.Vector3(),
      internalOptional: true
    },
    'source': {
      kind: 'static',
      type: 'sampler2D',
      value: undefined as undefined | THREE.Texture,
      effect: updateTextureEffect,
      updateUniform: false
    },
    'scaleX': {
      kind: 'dynamic',
      type: 'float',
      min: -1.0,
      value: 1.0,
      max: 1.0,
    },
    'scaleY': {
      kind: 'dynamic',
      type: 'float',
      min: -1.0,
      value: 1.0,
      max: 1.0,
    },
    'translateX': {
      kind: 'dynamic',
      type: 'float',
      min: -2.0,
      value: 0.0,
      max: 2.0,
    },
    'translateY': {
      kind: 'dynamic',
      type: 'float',
      min: -2.0,
      value: 0.0,
      max: 2.0
    },
    'wrap': {
      kind: 'choice',
      type: 'wrapping',
      value: THREE.MirroredRepeatWrapping,
      choices: {
        mirror: THREE.MirroredRepeatWrapping,
        repeat: THREE.RepeatWrapping,
        clamp: THREE.ClampToEdgeWrapping
      },
      effect: updateTextureEffect,
      updateUniform: false,
      external: true
    },
    'filtering': {
      kind: 'choice',
      type: 'filtering',
      value: THREE.LinearFilter,
      choices: {
        linear: THREE.LinearFilter,
        nearest: THREE.NearestFilter,
      },
      effect: updateTextureEffect,
      updateUniform: false,
      external: true
    },
  },
  glsl: dedent`
    vec2 samplePoint = (point.xy + vec2(translateX, translateY)) * vec2(scaleX, scaleY);
    return texture2D(source, samplePoint).rgb;
  `
} as const;