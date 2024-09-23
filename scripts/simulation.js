import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// Constants for simulation
const G = 1; // Gravitational constant
const dt = 0.01; // Time step
const minDistance = 0.1; // Minimum distance to avoid large forces
const maxTrailLength = 100; // Max number of points in the trail

function generateRandomBody() {
  const position = new THREE.Vector3(
    Math.random() * 4 - 2,  // Random position between -2 and 2
    Math.random() * 4 - 2,  // Random position between -2 and 2
    Math.random() * 4 - 2   // Random position between -2 and 2
  );
  const velocity = new THREE.Vector3(
    Math.random() * 0.01 - 0.05,  // Random velocity component
    Math.random() * 0.01 - 0.05,  // Random velocity component
    Math.random() * 0.01 - 0.05   // Random velocity component
  );
  const mass = Math.random() * 2 + 0.5;  // Random mass between 0.5 and 2.5
  const color = Math.random() * 0xffffff;  // Random color

  return { position, velocity, mass, color };
}

function getOrbitalVelocity(body1, body2) {
  const distance = body1.position.distanceTo(body2.position);
  return Math.sqrt((G * body2.mass) / distance);
}


class Body {
  constructor(position, velocity, mass, color) {
    this.initialPosition = position.clone(); // Store initial position
    this.initialVelocity = velocity.clone(); // Store initial velocity
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.color = color;
    this.trailPositions = [];

    this.trail = new THREE.BufferGeometry();
    this.trailMaterial = new THREE.LineBasicMaterial({ color: this.color });
    this.trailLine = new THREE.Line(this.trail, this.trailMaterial);
  }

  applyForce(force) {
    const acceleration = force.clone().divideScalar(this.mass);
    this.velocity.add(acceleration.multiplyScalar(dt));
  }

  updatePosition() {
    this.position.add(this.velocity.clone().multiplyScalar(dt));
  }

  updateTrail() {
    this.trailPositions.push(this.position.clone());

    if (this.trailPositions.length > maxTrailLength) {
      this.trailPositions.shift();
    }

    const positionsArray = new Float32Array(this.trailPositions.length * 3);
    this.trailPositions.forEach((pos, i) => {
      positionsArray[i * 3] = pos.x;
      positionsArray[i * 3 + 1] = pos.y;
      positionsArray[i * 3 + 2] = pos.z;
    });

    this.trail.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
    this.trail.setDrawRange(0, this.trailPositions.length);
  }

  reset() {
    this.position.copy(this.initialPosition);
    this.velocity.copy(this.initialVelocity);
    this.trailPositions = [];
    this.trail.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
  }
}

  
function createSimulation(containerId, numBodies) {
  // Generate random bodies
  const bodies = [];
  const positions = [];
  const velocities = [];
  const masses = [];
  const colors = [];

  const multiplikator = 2;


  for (let i = 0; i < numBodies; i++) {
    // Generate random initial conditions for each body
    const position = new THREE.Vector3(
      Math.sin(i*multiplikator),Math.sin(i*multiplikator),Math.sin(i*multiplikator)
    );
    const velocity = new THREE.Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1
    );
    const mass = 1;
    const color = (i+1) * 0xfffff;

    positions.push(position);
    velocities.push(velocity);
    masses.push(mass);
    colors.push(color);

    bodies.push(new Body(position, velocity, mass, color));
  }

  // Set initial velocities for orbital dynamics
  for (let i = 0; i < numBodies; i++) {
    for (let j = i + 1; j < numBodies; j++) {
      const body1 = bodies[i];
      const body2 = bodies[j];

      const distance = body1.position.distanceTo(body2.position);
      const orbitalVelocity = getOrbitalVelocity(body1, body2);
      const direction = body1.position.clone().sub(body2.position).normalize();

      // Set velocity perpendicular to the direction between the bodies
      const initialVelocity = new THREE.Vector3(-direction.y, direction.x, 0).multiplyScalar(orbitalVelocity);
      body1.velocity = initialVelocity;
    }
  }
    
  // Function to compute gravitational forces
  function computeGravitationalForce(body1, body2) {
    const distanceVec = body2.position.clone().sub(body1.position);
    let distance = distanceVec.length();
    if (distance < minDistance) distance = minDistance;

    const forceMagnitude = (G * body1.mass * body2.mass) / (distance * distance);
    return distanceVec.normalize().multiplyScalar(forceMagnitude);
  }

  function updateBodies() {
    for (let i = 0; i < numBodies; i++) {
      for (let j = i + 1; j < numBodies; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];

        const force = computeGravitationalForce(body1, body2);
        body1.applyForce(force);
        body2.applyForce(force.clone().negate());
      }

      bodies[i].updatePosition();
      bodies[i].updateTrail();
    }
  }

  // Set up Three.js scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();

  const container = document.getElementById(containerId);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  camera.position.set(0, 5, -3);
  
  // Orbit controls for each simulation
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Create meshes for each body
  bodies.forEach((body, index) => {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: body.color,side: THREE.DoubleSide, });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    body.mesh = sphere;
    scene.add(body.trailLine);
  });

  const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );
  //const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  //scene.add(ambientLight);

  function animate() {
    requestAnimationFrame(animate);

    updateBodies();

    bodies.forEach(body => {
      body.mesh.position.copy(body.position);
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
 

export { createSimulation };
