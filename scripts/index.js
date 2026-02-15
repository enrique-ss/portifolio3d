/* ========================================
   SCRIPT PARA INDEX.HTML (APENAS MODELOS GLB)
   VERSÃO LIMPA - SEM GEOMETRIAS PROCEDURAIS
======================================== */

import { INDEX_MODULES } from './config.js';

console.log('🚀 INICIANDO NOVO SISTEMA COM MODELOS GLB');
console.log('📦 Módulos a carregar:', INDEX_MODULES);

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xe2d1b1, 2, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const stars = createStarField(18000, 'rgba(226, 209, 177, 0.4)');
scene.add(stars);

console.log('✓ Cena configurada');

/* ========================================
   MAPEAMENTO DE MODELOS GLB
======================================== */
const MODEL_PATHS = {
    'Formação': './objects/earth.glb',
    'Experiências': './objects/planet.glb',
    'Projetos': './objects/zelda.glb'
};

console.log('📂 Caminhos dos modelos:', MODEL_PATHS);

/* ========================================
   VARIÁVEIS GLOBAIS
======================================== */
const moduleObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredModule = null;
let spaceship = null;
let isExperienceStarted = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

const profileCard = document.getElementById('profile-card');
const profileCardContainer = document.getElementById('profile-card-container');
const profileOverlay = document.getElementById('profile-overlay');

/* ========================================
   CARREGAMENTO DE MODELOS GLB
======================================== */

// Verificar se GLTFLoader existe
function checkGLTFLoader() {
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.error('❌ THREE.GLTFLoader não encontrado!');
        console.log('Verifique se você incluiu o script do GLTFLoader no HTML');
        return false;
    }
    console.log('✓ THREE.GLTFLoader disponível');
    return true;
}

// Criar loader
const loader = checkGLTFLoader() ? new THREE.GLTFLoader() : null;

// Função para carregar modelo GLB
function loadGLBModel(module, index) {
    if (!loader) {
        console.error('❌ Loader não disponível, pulando:', module.name);
        return Promise.reject('Loader não disponível');
    }

    const modelPath = MODEL_PATHS[module.name];
    console.log(`\n🔄 [${module.name}] Carregando de: ${modelPath}`);

    return new Promise((resolve, reject) => {
        loader.load(
            modelPath,
            (gltf) => {
                console.log(`✅ [${module.name}] MODELO CARREGADO COM SUCESSO!`);

                const model = gltf.scene;

                // Configurar escala personalizada para cada modelo
                let scale = 0.08; // padrão
                if (module.name === 'Formação') {
                    scale = 0.04; // Earth menor
                } else if (module.name === 'Experiências') {
                    scale = 0.01; // Planet menor
                } else if (module.name === 'Projetos') {
                    scale = 0.20; // Zelda maior
                }

                model.scale.set(scale, scale, scale);
                model.position.set(module.position.x, module.position.y, module.position.z);
                model.userData = { moduleIndex: index, module: module };

                // Configurar meshes internos
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.userData = { moduleIndex: index, module: module };
                        console.log(`  ↳ Mesh configurado: ${child.name || 'unnamed'}`);
                    }
                });

                scene.add(model);
                console.log(`  ↳ Adicionado à cena`);

                // Armazenar
                moduleObjects.push({ mesh: model, module });
                console.log(`✓ [${module.name}] Configuração completa!\n`);

                resolve();
            },
            (xhr) => {
                const percent = xhr.total > 0 ? (xhr.loaded / xhr.total * 100).toFixed(0) : '?';
                console.log(`  ↳ Progresso: ${percent}%`);
            },
            (error) => {
                console.error(`❌ [${module.name}] ERRO AO CARREGAR:`, error);
                console.log(`  ↳ Caminho tentado: ${modelPath}`);
                console.log(`  ↳ Verifique se o arquivo existe e o caminho está correto`);
                reject(error);
            }
        );
    });
}

// Inicializar carregamento de todos os modelos
async function initModels() {
    console.log('\n═══════════════════════════════════════');
    console.log('🎬 INICIANDO CARREGAMENTO DOS MODELOS');
    console.log('═══════════════════════════════════════\n');

    try {
        for (let i = 0; i < INDEX_MODULES.length; i++) {
            await loadGLBModel(INDEX_MODULES[i], i);
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 TODOS OS MODELOS FORAM CARREGADOS!');
        console.log(`📊 Total de objetos na cena: ${moduleObjects.length}`);
        console.log('═══════════════════════════════════════\n');
    } catch (error) {
        console.error('❌ Erro durante o carregamento:', error);
    }
}

// Iniciar carregamento imediatamente
initModels();

/* ========================================
   FUNÇÕES DE CONTROLE
======================================== */
function startExploration() {
    if (isExperienceStarted) return;
    console.log('🚀 Iniciando exploração...');

    isExperienceStarted = true;
    profileCardContainer.classList.add('hidden');
    profileOverlay.classList.add('hidden');

    document.getElementById('hud').classList.add('visible');
    document.getElementById('nav-hint').classList.add('visible');
    document.body.style.cursor = 'crosshair';
}

function returnToCard() {
    console.log('🔙 Retornando ao card...');
    isExperienceStarted = false;
    profileCardContainer.classList.remove('hidden');
    profileOverlay.classList.remove('hidden');

    document.getElementById('hud').classList.remove('visible');
    document.getElementById('nav-hint').classList.remove('visible');
    document.getElementById('info-panel').classList.remove('visible');
    document.body.style.cursor = 'default';
}

document.querySelectorAll('.explore-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
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
    if (isDragging || !isExperienceStarted) return;

    raycaster.setFromCamera(mouse, camera);

    const clickableMeshes = [];
    moduleObjects.forEach(obj => {
        if (obj.mesh.traverse) {
            obj.mesh.traverse((child) => {
                if (child.isMesh) {
                    clickableMeshes.push(child);
                }
            });
        } else if (obj.mesh.isMesh) {
            clickableMeshes.push(obj.mesh);
        }
    });

    const intersects = raycaster.intersectObjects(clickableMeshes, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const module = intersectedObject.userData.module;
        if (module && module.url) {
            console.log(`🎯 Clicou em: ${module.name}`);
            const targetMesh = moduleObjects[intersectedObject.userData.moduleIndex].mesh;
            navigateToModule(targetMesh, module.url);
        }
    }
});

function navigateToModule(targetMesh, url) {
    console.log(`🚀 Navegando para: ${url}`);
    isExperienceStarted = false;
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

    const clickableMeshes = [];
    moduleObjects.forEach(obj => {
        if (obj.mesh.traverse) {
            obj.mesh.traverse((child) => {
                if (child.isMesh) {
                    clickableMeshes.push(child);
                }
            });
        } else if (obj.mesh.isMesh) {
            clickableMeshes.push(obj.mesh);
        }
    });

    const intersects = raycaster.intersectObjects(clickableMeshes, true);

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
        profileCard.style.transform = `rotateY(${rotation.y * 10}deg) rotateX(${-rotation.x * 10}deg)`;
    }

    scene.rotation.y = rotation.y;
    scene.rotation.x = rotation.x;

    const time = Date.now() * 0.0001;
    moduleObjects.forEach((obj, i) => {
        obj.mesh.rotation.y += 0.003;
        obj.mesh.rotation.x += 0.0015;

        const orbitSpeed = 0.08 + i * 0.03;
        const driftX = Math.sin(time * orbitSpeed + i) * 0.002;
        const driftY = Math.cos(time * orbitSpeed * 0.7 + i) * 0.002;

        obj.mesh.position.x += driftX;
        obj.mesh.position.y += driftY;
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

/* ========================================
   INICIALIZAÇÃO
======================================== */
document.body.style.opacity = '0';
animate();

console.log('✓ Sistema de animação iniciado');