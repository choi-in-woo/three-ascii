// src/main.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js'

// 1. Scene & Camera
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 10)

// 2. Renderer & ASCII
const renderer = new THREE.WebGLRenderer({ alpha: true }) // alpha ON
renderer.setClearColor(0x000000, 0) // 완전 투명 배경

const effect = new AsciiEffect(renderer, ' .-*%@+#=', {
  invert: false,
  resolution: 0.2
})
effect.setSize(window.innerWidth, window.innerHeight)
effect.domElement.style.color = 'black'
effect.domElement.style.backgroundColor = 'transparent' // 배경 투명
effect.domElement.style.fontSize = '4px'
effect.domElement.style.lineHeight = '4.5px'
effect.domElement.style.letterSpacing = '-1px'
effect.domElement.style.fontFamily = 'monospace'
effect.domElement.style.whiteSpace = 'pre'
document.body.style.margin = '0'
document.body.style.overflow = 'hidden'
document.body.style.backgroundColor = '#D9D9D9' // 회색 바탕 직접 지정
document.body.appendChild(effect.domElement)

// 3. Controls
const controls = new OrbitControls(camera, effect.domElement)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false

// 4. Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.25))
const keyLight = new THREE.DirectionalLight(0xffffff, 2)
keyLight.position.set(5, 3, 10)
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.2)
fillLight.position.set(-2, -2, 2)
scene.add(fillLight)

// 5. Load Model
let objModel = null
const mtlLoader = new MTLLoader()
mtlLoader.setPath('/').load('lion.mtl', (materials) => {
  materials.preload()

  const objLoader = new OBJLoader()
  objLoader.setMaterials(materials)
  objLoader.setPath('/').load('lion.obj', (obj) => {
    obj.scale.set(0.1, 0.1, 0.1)

    const box = new THREE.Box3().setFromObject(obj)
    const center = box.getCenter(new THREE.Vector3())
    obj.position.sub(center)

    obj.traverse((child) => {
      if (child.isMesh) {
        const name = child.material.name?.toLowerCase() || ''
        let color = 0xffffff
        if (name === 'black') color = 0x111111
        else if (name === 'mouse') color = 0xbbbbbb

        child.material = new THREE.MeshStandardMaterial({
          color,
          roughness: 1.0,
          metalness: 0.0,
          flatShading: false
        })
      }
    })

    objModel = obj
    scene.add(obj)
  })
})

// 6. Mouse Interaction
let targetRotationX = 0
let targetRotationY = 0
window.addEventListener('mousemove', (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1
  const mouseY = (event.clientY / window.innerHeight) * 2 - 1
  targetRotationY = mouseX * Math.PI * 0.3
  targetRotationX = mouseY * Math.PI * 0.3
})

// 7. Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  effect.setSize(window.innerWidth, window.innerHeight)
})

// 8. Animate
function animate() {
  requestAnimationFrame(animate)

  if (objModel) {
    objModel.rotation.y += (targetRotationY - objModel.rotation.y) * 0.05
    objModel.rotation.x += (targetRotationX - objModel.rotation.x) * 0.05
  }

  controls.update()
  effect.render(scene, camera)
}
animate()
