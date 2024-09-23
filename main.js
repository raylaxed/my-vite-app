import { createSimulation } from './scripts/simulation.js';
import { createLorenzAttractor } from './scripts/lorenzAttractor.js';  // Import the Lorenz Attractor function
import {init} from './scripts/mandelbrot.js';



document.addEventListener('DOMContentLoaded', () => {
  // Create 4 simulations with different numbers of bodies
  const simulations = [
    createSimulation('simulation1', 3),
    createSimulation('simulation2', 3),
    createSimulation('simulation3', 3),
    createSimulation('simulation4', 3),
  ];

  // Add event listeners for reset buttons
  document.getElementById('reset1').addEventListener('click', () => {
    console.log('Resetting Simulation 1');
    simulations[0].reset();
  });
  document.getElementById('reset2').addEventListener('click', () => {
    console.log('Resetting Simulation 2');
    simulations[1].reset();
  });
  document.getElementById('reset3').addEventListener('click', () => {
    console.log('Resetting Simulation 3');
    simulations[2].reset();
  });
  document.getElementById('reset4').addEventListener('click', () => {
    console.log('Resetting Simulation 4');
    simulations[3].reset();
  });

  // Create 4 Lorenz Attractor visualizations with different initial conditions
  const lorenzAttractors = [
    { containerId: 'lorenzAttractor1', x: 0.1, y: 0, z: 0 },
    { containerId: 'lorenzAttractor2', x: 1.0, y: 0.5, z: 0.5 },
    { containerId: 'lorenzAttractor3', x: -0.5, y: 1.5, z: -1.0 },
    { containerId: 'lorenzAttractor4', x: 2.0, y: -1.0, z: 1.0 }
  ];

  lorenzAttractors.forEach(attr => {
    const container = document.getElementById(attr.containerId);
    if (container) {
      createLorenzAttractor(attr.containerId, 10, 28, 8 / 3, 0.01, attr.x, attr.y, attr.z);
    }
  });

  // Initialize and draw the Mandelbrot set
  init();
});