import {
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  UnsignedByteType,
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

    this.renderTarget = new WebGLRenderTarget(this.width, this.height, {
      format: RGBAFormat,
      type: UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false
    })
    this.renderTarget.texture.minFilter = LinearFilter
    this.renderTarget.texture.magFilter = LinearFilter

    this.domElement = document.createElement('pre')
    this.domElement.style.whiteSpace = 'pre'
    this.domElement.style.display = 'block'
    this.domElement.style.margin = '0 auto'
    this.domElement.style.transform = 'scaleY(-1)' // 세로 반전 복구
    this.setSize(size.x, size.y)

    this.buffer = new Uint8Array(this.width * this.height * 4)
    this.lineDelays = []
    this.lineElapsed = []
  }

  setSize(width, height) {
    this.width = Math.floor(width * this.resolution)
    this.height = Math.floor(height * this.resolution)
    this.renderTarget.setSize(this.width, this.height)
    this.buffer = new Uint8Array(this.width * this.height * 4)
    this.lineDelays = Array(this.width).fill(0).map(() => Math.random() * 1000)
    this.lineElapsed = Array(this.width).fill(0)
  }

  setCharacters(characters) {
    this.characters = characters
    this.charTable = characters.split('')
    this.charTableLen = this.charTable.length
  }

  render(scene, camera, delta = 16) {
    const originalAlpha = this.renderer.getClearAlpha()
    this.renderer.setClearAlpha(0)

    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.clear()
    this.renderer.render(scene, camera)
    this.renderer.readRenderTargetPixels(
      this.renderTarget,
      0, 0,
      this.width, this.height,
      this.buffer
    )
    this.renderer.setRenderTarget(null)
    this.renderer.setClearAlpha(originalAlpha)

    let output = ''
    for (let y = 0; y < this.height; y++) {
      let line = ''
      for (let x = 0; x < this.width; x++) {
        this.lineElapsed[x] += delta
        const showPixel = this.lineElapsed[x] >= this.lineDelays[x]

        const i = ((this.height - 1 - y) * this.width + x) * 4 // 좌표 보정
        const r = this.buffer[i]
        const g = this.buffer[i + 1]
        const b = this.buffer[i + 2]
        const a = this.buffer[i + 3]

        if (a < 10 || !showPixel) {
          line += ' '
          continue
        }

        const brightness = (r + g + b) / 3
        const index = this.invert
          ? this.charTableLen - 1 - Math.floor((brightness / 255) * (this.charTableLen - 1))
          : Math.floor((brightness / 255) * (this.charTableLen - 1))
        line += this.charTable[index]
      }
      output += line + '\n'
    }

    this.output = output
    this.domElement.textContent = output
  }
}