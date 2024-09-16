import * as THREE from 'three';

export class Body {
  constructor(position, velocity, mass, color, scene) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.color = color;

    this.trail = new THREE.BufferGeometry();
    this.trailPositions = [];
    this.trailMaterial = new THREE.LineBasicMaterial({ color: this.color });
    this.trailLine = new THREE.Line(this.trail, this.trailMaterial);
    scene.add(this.trailLine);
  }

  applyForce(force) {
    const acceleration = force.clone().divideScalar(this.mass);
    this.velocity.add(acceleration.multiplyScalar(0.01)); // dt = 0.01
  }

  updatePosition() {
    this.position.add(this.velocity.clone().multiplyScalar(0.01)); // dt = 0.01
  }

  updateTrail() {
    this.trailPositions.push(this.position.clone());

    if (this.trailPositions.length > 100) {
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
}