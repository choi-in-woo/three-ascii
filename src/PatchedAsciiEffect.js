import {
  WebGLRenderTarget,
  LinearFilter,
  RGBFormat,
  Vector2
} from 'three'

export class PatchedAsciiEffect {
  constructor(renderer, characters, options = {}) {
    this.renderer = renderer
    this.characters = characters
    this.resolution = options.resolution || 0.15
    this.invert = options.invert || false

    const size = renderer.getSize(new Vector2())
    this.width = Math.floor(size.x * this.resolution)
    this.height = Math.floor(size.y * this.resolution)

    this.charTable = characters.split('')
    this.charTableLen = this.charTable.length

    this.renderTarget = new WebGLRenderTarget(this.width, this.height)
    this.renderTarget.texture.minFilter = LinearFilter
    this.renderTarget.texture.magFilter = LinearFilter
    this.renderTarget.texture.format = RGBFormat

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.context = this.canvas.getContext('2d')

    this.domElement = document.createElement('pre')
    this.domElement.style.whiteSpace = 'pre'
    this.domElement.style.fontFamily = 'monospace'
    this.domElement.style.margin = '0'
    this.domElement.style.lineHeight = '6px'
    this.domElement.style.fontSize = '6px'
    this.domElement.style.letterSpacing = '-1px'
    this.domElement.style.color = 'black'
    this.domElement.style.backgroundColor = 'white'
  }

  setSize(width, height) {
    this.renderer.setSize(width, height)
    this.width = Math.floor(width * this.resolution)
    this.height = Math.floor(height * this.resolution)
    this.renderTarget.setSize(this.width, this.height)
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  setCharacters(characters) {
    this.characters = characters
    this.charTable = characters.split('')
    this.charTableLen = this.charTable.length
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(scene, camera)
    this.renderer.setRenderTarget(null)

    this.context.drawImage(this.renderer.domElement, 0, 0, this.width, this.height)
    const imageData = this.context.getImageData(0, 0, this.width, this.height).data

    let output = ''
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      const brightness = this.invert
        ? 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255
        : (0.299 * r + 0.587 * g + 0.114 * b) / 255
      const charIndex = Math.floor(brightness * (this.charTableLen - 1))
      output += this.charTable[charIndex]

      if ((i / 4 + 1) % this.width === 0) output += '\n'
    }

    this.domElement.textContent = output
  }
}
