import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class LorenzAttractor {
  constructor(containerId, sigma = 10, rho = 28, beta = 8 / 3, dt = 0.01, x = 0.1, y = 0, z = 0) {
    this.sigma = sigma;
    this.rho = rho;
    this.beta = beta;
    this.dt = dt;

    // Initial position of the Lorenz attractor
    this.x = x;
    this.y = y;
    this.z = z;

    this.positions = [];
    this.maxTrailLength = 10000; // Number of points in the trail

    this.createScene(containerId);
    this.createTrail();
    this.animate();
  }

  // Function to compute the next point in the Lorenz attractor
  computeNextPoint() {
    const dx = this.sigma * (this.y - this.x) * this.dt;
    const dy = (this.x * (this.rho - this.z) - this.y) * this.dt;
    const dz = (this.x * this.y - this.beta * this.z) * this.dt;

    this.x += dx;
    this.y += dy;
    this.z += dz;

    this.positions.push(new THREE.Vector3(this.x, this.y, this.z));

    // Remove old points to limit trail length
    if (this.positions.length > this.maxTrailLength) {
      this.positions.shift();
    }
  }

  // Set up the scene, camera, and renderer
  createScene(containerId) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(-100, 30, 60);

    this.renderer = new THREE.WebGLRenderer();
    const container = document.getElementById(containerId);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const tgrid = new THREE.GridHelper(100,100);
    //this.scene.add(tgrid);

    // OrbitControls for camera interaction
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // Create the trail for the Lorenz attractor
  createTrail() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    this.line = new THREE.Line(this.geometry, this.material);
    this.scene.add(this.line);
  }

  // Update the trail with the latest positions
  updateTrail() {
    const positionsArray = new Float32Array(this.positions.length * 3);
    this.positions.forEach((pos, i) => {
      positionsArray[i * 3] = pos.x;
      positionsArray[i * 3 + 1] = pos.y;
      positionsArray[i * 3 + 2] = pos.z;
    });

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionsArray, 3)
    );
    this.geometry.setDrawRange(0, this.positions.length);
  }

  // The animation loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Compute the next point of the Lorenz attractor
    this.computeNextPoint();

    // Update the trail
    this.updateTrail();

    // Update controls and render the scene
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

function createLorenzAttractor(containerId, sigma, rho, beta, dt, x, y, z) {
  new LorenzAttractor(containerId, sigma, rho, beta, dt, x, y, z);
}

export { createLorenzAttractor };