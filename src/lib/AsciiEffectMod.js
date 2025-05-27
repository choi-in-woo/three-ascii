import {
  WebGLRenderTarget,
  LinearFilter,
  RGBFormat,
  Vector2
} from 'three'

export class AsciiEffect {
  constructor(renderer, characters, options = {}) {
    this.renderer = renderer
    this.characters = characters
    this.resolution = options.resolution || 0.2
    this.invert = options.invert || false

    this.charTable = characters.split('')
    this.charTableLen = this.charTable.length

    const size = renderer.getSize(new Vector2())
    this.width = Math.floor(size.x * this.resolution)
    this.height = Math.floor(size.y * this.resolution)

    this.renderTarget = new WebGLRenderTarget(this.width, this.height)
    this.renderTarget.texture.minFilter = LinearFilter
    this.renderTarget.texture.magFilter = LinearFilter
    this.renderTarget.texture.format = RGBFormat

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.context = this.canvas.getContext('2d', { willReadFrequently: true })

    this.domElement = document.createElement('pre')
    this.domElement.style.whiteSpace = 'pre'
    this.domElement.style.fontFamily = 'monospace'
    this.domElement.style.margin = '0'
    this.domElement.style.padding = '0'
    this.domElement.style.userSelect = 'none'
    this.domElement.style.backgroundColor = 'transparent'
    this.domElement.style.color = 'black'
    this.domElement.style.pointerEvents = 'none'
  }

  setSize(width, height) {
    this.width = Math.floor(width * this.resolution)
    this.height = Math.floor(height * this.resolution)
    this.renderTarget.setSize(this.width, this.height)
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(scene, camera)
    this.renderer.setRenderTarget(null)

    this.context.drawImage(this.renderer.domElement, 0, 0, this.width, this.height)

    const imageData = this.context.getImageData(0, 0, this.width, this.height).data
    let output = ''

    for (let y = 0; y < this.height; y++) {
      let line = ''
      for (let x = 0; x < this.width; x++) {
        const index = (y * this.width + x) * 4
        const r = imageData[index]
        const g = imageData[index + 1]
        const b = imageData[index + 2]

        // 밝은 배경 무시
        if (r > 245 && g > 245 && b > 245) {
          line += ' '
        } else {
          const brightness = (r + g + b) / 3
          const charIndex = Math.floor((brightness / 255) * (this.charTableLen - 1))
          line += this.charTable[this.invert ? this.charTableLen - 1 - charIndex : charIndex]
        }
      }
      output += line + '\n'
    }

    this.domElement.textContent = output
  }
}
