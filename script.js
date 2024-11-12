const sectors = [
  {color: "#f82", label: "Stack", probability: 0.4},  // 40% de probabilidad
  {color: "#0bf", label: "10", probability: 0.35},    // 35% de probabilidad
  {color: "#0fb", label: "50", probability: 0.2},     // 20% de probabilidad
  {color: "#fb0", label: "100", probability: 0.04},   // 4% de probabilidad
  {color: "#b0f", label: "200", probability: 0.01}    // 1% de probabilidad
];

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const elSpin = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / tot;
const friction = 0.991;  // 0.995=soft, 0.99=mid, 0.98=hard
const angVelMin = 0.002; // Velocidad mínima de giro
let angVelMax = 0; // Velocidad angular máxima para alcanzar
let angVel = 0;    // Velocidad angular actual
let ang = 0;       // Ángulo de rotación en radianes
let isSpinning = false;
let isAccelerating = false;
let animFrame = null; // requestAnimationFrame del motor

//* Obtener índice del sector actual */
const getIndex = () => Math.floor(tot - ang / TAU * tot) % tot;

//* Dibujar sectores y premios en el canvas */
const drawSector = (sector, i) => {
  const ang = arc * i;
  ctx.save();
  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();
  // TEXTO
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  ctx.restore();
};

//* Rotar el elemento canvas */
const rotate = () => {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  elSpin.textContent = !angVel ? "GIRAR" : sector.label;
  elSpin.style.background = sector.color;
};

//* Genera un índice basado en probabilidades */
const getWeightedRandomIndex = () => {
  const totalWeight = sectors.reduce((sum, sector) => sum + sector.probability, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (let i = 0; i < sectors.length; i++) {
    cumulative += sectors[i].probability;
    if (random <= cumulative) return i;
  }
};

//* Animación del giro */
const frame = () => {
  if (!isSpinning) return;

  if (angVel >= angVelMax) isAccelerating = false;

  // Acelerar
  if (isAccelerating) {
    angVel ||= angVelMin; // Impulso inicial
    angVel *= 1.06; // Acelerar
  } 
  // Frenar
  else {
    angVel *= friction; // Desacelerar con fricción  

    // FIN DEL GIRO
    if (angVel < angVelMin) {
      isSpinning = false;
      angVel = 0;
      cancelAnimationFrame(animFrame);
      
      const sector = sectors[getIndex()];
      alert(`¡Felicidades! Obtuviste: ${sector.label}`);
    }
  }

  ang += angVel; // Actualizar ángulo
  ang %= TAU;    // Normalizar ángulo
  rotate();      // Rotar canvas
};

//* Iniciar la animación */
const engine = () => {
  frame();
  animFrame = requestAnimationFrame(engine);
};

//* Evento de clic para girar */
elSpin.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;
  isAccelerating = true;
  
  // Seleccionar un índice ponderado en base a probabilidades
  const weightedIndex = getWeightedRandomIndex();
  ang = TAU * (1 - weightedIndex / tot); // Ajustar el ángulo inicial según el premio
  
  angVelMax = rand(0.25, 0.40);
  engine(); // Iniciar el motor de animación
});

// Inicializar
sectors.forEach(drawSector);
rotate(); // Rotación inicial

const simulateSpins = (numSpins) => {
  const results = {};
  sectors.forEach(sector => results[sector.label] = 0); // Inicializar conteo de cada premio

  for (let i = 0; i < numSpins; i++) {
    const weightedIndex = getWeightedRandomIndex(); // Obtener el índice ponderado
    const sectorLabel = sectors[weightedIndex].label;
    results[sectorLabel] += 1; // Contabilizar el premio
  }

  console.log(results)

  console.log("Resultados de la simulación de giros:");
  Object.keys(results).forEach(label => {
    console.log(`${label}: ${results[label]} veces (${((results[label] / numSpins) * 100).toFixed(2)}%)`);
  });
};

// Ejecutar la simulación de 1000 giros
simulateSpins(1000);