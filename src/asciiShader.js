export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D asciiMap;
  uniform sampler2D sceneTexture;
  uniform float charsPerRow;
  uniform float charSize;
  uniform float brightness;
  varying vec2 vUv;

  void main() {
    vec2 texSize = vec2(textureSize(sceneTexture, 0));
    vec2 coord = vUv * texSize;

    vec4 color = texture2D(sceneTexture, vUv);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114)) * brightness;
    float index = floor(gray * (charsPerRow * charsPerRow - 1.0));
    float x = mod(index, charsPerRow);
    float y = floor(index / charsPerRow);

    vec2 uvChar = vec2(x, y) / charsPerRow + fract(coord / charSize) / charsPerRow;
    vec4 asciiChar = texture2D(asciiMap, uvChar);

    gl_FragColor = vec4(asciiChar.rgb, 1.0);
  }
`;
