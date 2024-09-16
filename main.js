import { createSimulation } from './scripts/simulation.js';

// Create 4 simulations with different numbers of bodies
const simulations = [
  createSimulation('simulation1', 15),
  createSimulation('simulation2', 15),
  createSimulation('simulation3', 15),
  createSimulation('simulation4', 15),
];
//test
// Add event listeners for reset buttons
document.getElementById('reset1').addEventListener('click', () => simulations[0].reset());
document.getElementById('reset2').addEventListener('click', () => simulations[1].reset());
document.getElementById('reset3').addEventListener('click', () => simulations[2].reset());
document.getElementById('reset4').addEventListener('click', () => simulations[3].reset());