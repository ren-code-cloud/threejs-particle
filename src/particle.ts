import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let container: HTMLDivElement,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  orbit: OrbitControls,
  particlesGeometry: THREE.BufferGeometry,
  particles: THREE.Points;

function init() {
  container = document.querySelector(".background") as HTMLDivElement;
  if (!container) {
    console.error("Container not found");
    return;
  }

  renderer = new THREE.WebGLRenderer();
  if (!renderer) {
    console.error("WebGLRenderer initialization failed");
    return;
  }

  const containerRect = container.getBoundingClientRect();
  renderer.setSize(containerRect.width, containerRect.height);

  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 200);

  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enabled = false; // Disable user input

  // hide the controls
  orbit.enablePan = false;
  orbit.enableRotate = false;
  orbit.enableZoom = false;

  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  // Create particles
  createParticles();

  // Add resize listener
  window.addEventListener("resize", onWindowResize);

  // Start animation loop
  animate();
}

// Create particles
function createParticles() {
  const circleMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / length(mvPosition.xyz));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        gl_FragColor.a = 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0;
      }
    `,
    vertexColors: true,
  });

  const counts = 7000;
  const positions = new Float32Array(counts * 3);

  for (let i = 0; i < counts; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
  }

  particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particles = new THREE.Points(particlesGeometry, circleMaterial);
  scene.add(particles);
}

// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
async function animate() {
  requestAnimationFrame(animate);

  // Update particles position
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= 0.01;
    if (positions[i + 1] < -500) {
      positions[i + 1] = 500;
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

// Initialize
init();
