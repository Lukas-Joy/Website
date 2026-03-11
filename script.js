import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js'

const canvas = document.getElementById('webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)
scene.fog = new THREE.Fog(0x000000, 6, 12)

// Camera (now at center)
const camera = new THREE.PerspectiveCamera(
	40, // narrow FOV
	window.innerWidth / window.innerHeight,
	0.1,
	100
)

camera.position.set(0, 0, 0)
camera.lookAt(0, 0, -1)

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: false
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(1)

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)

const directional = new THREE.DirectionalLight(0xffffff, 0.8)
directional.position.set(5, 5, 5)
scene.add(directional)

// Ring group
const ringGroup = new THREE.Group()
scene.add(ringGroup)

// Geometry material
const material = new THREE.MeshStandardMaterial({
	color: 0xaaaaaa,
	flatShading: true
})

const radius = 8
const count = 4

for (let i = 0; i < count; i++) {

	let geometry

	switch (i) {
		case 0:
			geometry = new THREE.BoxGeometry(2, 2, 2)
			break
		case 1:
			geometry = new THREE.ConeGeometry(1.5, 3, 8)
			break
		case 2:
			geometry = new THREE.TorusGeometry(1.2, 0.4, 6, 12)
			break
		case 3:
			geometry = new THREE.CylinderGeometry(1, 1, 2, 10)
			break
	}

	const mesh = new THREE.Mesh(geometry, material)

	const angle = (i / count) * Math.PI * 2

	mesh.position.x = Math.sin(angle) * radius
	mesh.position.z = Math.cos(angle) * radius

	// Make objects face inward
	mesh.lookAt(0, 0, 0)

	ringGroup.add(mesh)
}

// Rotation system (step-based)
let currentRotation = 0
let targetRotation = 0
let isAnimating = false

const stepAngle = (Math.PI * 2) / count

function rotate(direction) {

	if (isAnimating) return

	targetRotation += direction * stepAngle
	isAnimating = true
}

// Click navigation
window.addEventListener('click', (e) => {

	if (e.clientX < window.innerWidth / 2) {
		rotate(-1)
	} else {
		rotate(1)
	}
})

// Animation
function animate() {

	requestAnimationFrame(animate)

	if (isAnimating) {

		const diff = targetRotation - currentRotation
		currentRotation += diff * 0.08

		if (Math.abs(diff) < 0.001) {
			currentRotation = targetRotation
			isAnimating = false
		}

		ringGroup.rotation.y = currentRotation
	}

	renderer.render(scene, camera)
}

animate()

// Resize
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})