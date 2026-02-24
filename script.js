import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js'

const canvas = document.getElementById('webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

// Camera
const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	0.1,
	100
)

camera.position.set(0, 2, 6)

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: false
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(1) // PSX vibe

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)

const directional = new THREE.DirectionalLight(0xffffff, 0.8)
directional.position.set(5, 10, 5)
scene.add(directional)

// Group to rotate
const ringGroup = new THREE.Group()
scene.add(ringGroup)

// Geometry & Material
const material = new THREE.MeshStandardMaterial({
	color: 0xaaaaaa,
	flatShading: true
})

// Create 4 objects in a ring
const radius = 5
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

	ringGroup.add(mesh)
}

// Rotation State
let currentIndex = 0
let targetRotation = 0
let isAnimating = false

function rotateToIndex(index) {
	currentIndex = (index + count) % count
	targetRotation = (currentIndex / count) * Math.PI * 2
	isAnimating = true
}

// Click Navigation
window.addEventListener('click', (e) => {
	if (isAnimating) return

	if (e.clientX < window.innerWidth / 2) {
		rotateToIndex(currentIndex - 1)
	} else {
		rotateToIndex(currentIndex + 1)
	}
})

// Animation Loop
function animate() {
	requestAnimationFrame(animate)

	if (isAnimating) {
		const diff = targetRotation - ringGroup.rotation.y

		ringGroup.rotation.y += diff * 0.1

		if (Math.abs(diff) < 0.001) {
			ringGroup.rotation.y = targetRotation
			isAnimating = false
		}
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