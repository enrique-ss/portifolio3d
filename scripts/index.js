/* ========================================
   SCRIPT PARA INDEX.HTML (CORRIGIDO)
======================================== */

import { INDEX_MODULES } from './config.js';

/* ========================================
   FUNÇÃO PARA CRIAR CAMPO DE ESTRELAS
======================================== */
function createStarField(starCount, color) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.2, 'white');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = [];
    const starsSizes = [];

    for (let i = 0; i < starCount; i++) {
        starsPositions.push(
            (Math.random() - 0.5) * 1200,
            (Math.random() - 0.5) * 1200,
            (Math.random() - 0.5) * 2500
        );
        starsSizes.push(Math.random() * 3 + 1);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        size: 4.0,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8,
        sizeAttenuation: true
    });

    return new THREE.Points(starsGeometry, starsMaterial);
}

/* ========================================
   CONFIGURAÇÃO DA CENA THREE.JS
======================================== */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xe2d1b1, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const stars = createStarField(18000, 'rgba(226, 209, 177, 0.4)');
scene.add(stars);

/* ========================================
   CRIAÇÃO DOS MÓDULOS 3D
======================================== */
const moduleObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredModule = null;

INDEX_MODULES.forEach((module, index) => {
    const geometry = new THREE.IcosahedronGeometry(0.8, 2);
    const material = new THREE.MeshBasicMaterial({
        color: module.color,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(module.position.x, module.position.y, module.position.z);
    mesh.userData = { moduleIndex: index, module: module };
    scene.add(mesh);

    const glowGeometry = new THREE.IcosahedronGeometry(0.9, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: module.color,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);

    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = [];
    for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.3 + Math.random() * 0.3;
        ringPositions.push(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 0.1,
            Math.sin(angle) * radius
        );
    }
    ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPositions, 3));
    const ringMaterial = new THREE.PointsMaterial({
        color: module.color,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Points(ringGeometry, ringMaterial);
    scene.add(ring);
    ring.position.copy(mesh.position);

    moduleObjects.push({ mesh, glow, ring, module });
});

/* ========================================
   VARIÁVEIS DE ESTADO E ELEMENTOS UI
======================================== */
let spaceship = null;
let isExperienceStarted = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

const profileCard = document.getElementById('profile-card');
const profileCardContainer = document.getElementById('profile-card-container');
const profileOverlay = document.getElementById('profile-overlay');

/* ========================================
   FUNÇÕES DE CONTROLE
======================================== */
function startExploration() {
    if (isExperienceStarted) return; // Evita múltiplas chamadas

    isExperienceStarted = true;
    profileCardContainer.classList.add('hidden');
    profileOverlay.classList.add('hidden');

    document.getElementById('hud').classList.add('visible');
    document.getElementById('nav-hint').classList.add('visible');
    document.body.style.cursor = 'crosshair';
}

function returnToCard() {
    isExperienceStarted = false;
    profileCardContainer.classList.remove('hidden');
    profileOverlay.classList.remove('hidden');

    document.getElementById('hud').classList.remove('visible');
    document.getElementById('nav-hint').classList.remove('visible');
    document.getElementById('info-panel').classList.remove('visible');
    document.body.style.cursor = 'default';
}

// Escuta cliques nos botões de exploração (Frente e Verso)
document.querySelectorAll('.explore-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede o clique de passar para o canvas
        startExploration();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExperienceStarted) {
        returnToCard();
    }
});

/* ========================================
   CONTROLES DE MOUSE
======================================== */
document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        rotation.y += deltaMove.x * 0.005;
        rotation.x += deltaMove.y * 0.005;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    if (!isExperienceStarted) return;
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(8, Math.min(30, camera.position.z));
}, { passive: true });

/* ========================================
   NAVEGAÇÃO INTERPLANETÁRIA
======================================== */
document.addEventListener('click', () => {
    // Só processa cliques no cenário se a experiência começou
    if (isDragging || !isExperienceStarted) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(moduleObjects.map(m => m.mesh));

    if (intersects.length > 0) {
        const targetModule = intersects[0].object;
        const module = targetModule.userData.module;
        if (module.url) {
            navigateToModule(targetModule, module.url);
        }
    }
});

function navigateToModule(targetMesh, url) {
    isExperienceStarted = false; // Trava interações durante a animação
    document.getElementById('info-panel').classList.remove('visible');

    const shipGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    spaceship = new THREE.Mesh(shipGeometry, shipMaterial);

    const startPos = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -30);
    spaceship.position.copy(startPos);
    scene.add(spaceship);

    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(60);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);

    const targetPos = targetMesh.position.clone();
    gsap.to(spaceship.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 3,
        ease: 'power2.inOut',
        onUpdate: function () {
            spaceship.lookAt(targetPos);
            spaceship.rotation.x += Math.PI / 2;

            const positions = trail.geometry.attributes.position.array;
            for (let i = positions.length - 3; i >= 3; i -= 3) {
                positions[i] = positions[i - 3];
                positions[i + 1] = positions[i - 2];
                positions[i + 2] = positions[i - 1];
            }
            positions[0] = spaceship.position.x;
            positions[1] = spaceship.position.y;
            positions[2] = spaceship.position.z;
            trail.geometry.attributes.position.needsUpdate = true;
        },
        onComplete: function () {
            gsap.to(targetMesh.material, {
                opacity: 1,
                duration: 0.2,
                yoyo: true,
                repeat: 3
            });

            setTimeout(() => {
                gsap.to(document.body, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        window.location.href = url;
                    }
                });
            }, 500);
        }
    });
}

/* ========================================
   HOVER E UI
======================================== */
function updateHover() {
    if (!isExperienceStarted) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(moduleObjects.map(m => m.mesh));

    if (intersects.length > 0) {
        const moduleIndex = intersects[0].object.userData.moduleIndex;

        if (hoveredModule !== moduleIndex) {
            hoveredModule = moduleIndex;
            const module = INDEX_MODULES[moduleIndex];

            document.getElementById('info-title').textContent = module.name;
            document.getElementById('info-filename').textContent = module.filename;
            document.getElementById('info-description').textContent = module.description;
            document.getElementById('info-panel').classList.add('visible');
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredModule !== null) {
            hoveredModule = null;
            document.getElementById('info-panel').classList.remove('visible');
            document.body.style.cursor = 'crosshair';
        }
    }
}

/* ========================================
   LOOP DE ANIMAÇÃO
======================================== */
function animate() {
    if (!isExperienceStarted) {
        // Efeito de inclinação suave no card baseado na rotação da cena
        profileCard.style.transform = `rotateY(${rotation.y * 10}deg) rotateX(${-rotation.x * 10}deg)`;
    }

    scene.rotation.y = rotation.y;
    scene.rotation.x = rotation.x;

    const time = Date.now() * 0.0001;
    moduleObjects.forEach((obj, i) => {
        obj.mesh.rotation.y += 0.0015;
        obj.mesh.rotation.x += 0.0005;
        obj.ring.rotation.y += 0.002;

        const orbitSpeed = 0.1 + i * 0.05;
        const driftX = Math.sin(time * orbitSpeed + i) * 0.003;
        const driftY = Math.cos(time * orbitSpeed * 0.7 + i) * 0.003;

        obj.mesh.position.x += driftX;
        obj.mesh.position.y += driftY;
        obj.ring.position.copy(obj.mesh.position);

        const pulse = Math.sin(Date.now() * 0.001 + i) * 0.1 + 1;
        obj.glow.scale.set(pulse, pulse, pulse);
    });

    stars.rotation.y += 0.0002;

    updateHover();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

/* ========================================
   EVENTOS GERAIS
======================================== */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', () => {
    gsap.to(document.body, { opacity: 1, duration: 1 });
});

// Inicialização
document.body.style.opacity = '0';
animate();