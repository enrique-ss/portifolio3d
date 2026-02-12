/* ========================================
   SCRIPT PARA FORMACAO.HTML
======================================== */

import {
    initLoadingScreen,
    initMouseTracking,
    updateHUDCoords,
    createStarField,
    createCore,
    setupBasicScene,
    handleWindowResize,
    setupCard3DTilt,
    setupScrollAnimations,
    setupScrollTimeline
} from './shared-functions.js';

import { PAGE_COLORS, GEOMETRY_CONFIG, ANIMATION_CONFIG } from './config.js';

// Registrar plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// Inicializar loading
initLoadingScreen();

// Inicializar tracking do mouse
const mouseTracker = initMouseTracking();

// Configurar cena Three.js
const { scene, camera, renderer } = setupBasicScene();

// Obter configurações da página
const pageConfig = PAGE_COLORS.formacao;
const geometryConfig = GEOMETRY_CONFIG.formacao;
const animConfig = ANIMATION_CONFIG.coreRotation.formacao;

// Criar campo de estrelas
const starField = createStarField(18000, pageConfig.accentRgba);
scene.add(starField);

// Criar core
const core = createCore(geometryConfig.type, pageConfig.accent, 1.5);
scene.add(core);

// Configurar animações de scroll
setupScrollTimeline(camera, core, core.material);
setupScrollAnimations();
setupCard3DTilt();

// Loop de animação
function animate() {
    const { mouseX, mouseY } = mouseTracker.updateMouse();

    // Rotacionar campo de estrelas
    starField.rotation.x = mouseY * 0.05;
    starField.rotation.y = mouseX * 0.05;
    starField.rotation.y += ANIMATION_CONFIG.starFieldRotation;

    // Rotacionar core
    core.rotation.y += animConfig.y;
    core.rotation.x += animConfig.x;
    core.rotation.y += mouseX * 0.001;
    core.rotation.x += mouseY * 0.001;

    // Atualizar HUD
    updateHUDCoords(mouseX, mouseY, camera.position.z);

    // Renderizar
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Gerenciar redimensionamento
handleWindowResize(camera, renderer);

// Iniciar animação
animate();