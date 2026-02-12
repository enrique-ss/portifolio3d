/* ========================================
   PAGES.JS - TUDO PARA PÁGINAS DE CONTEÚDO
   Usado por: experiencias.html, formacao.html, projetos.html
======================================== */

import { CONFIG } from './config.js';

/* ========================================
   UTILITÁRIOS
======================================== */

function initLoadingScreen() {
    const loadingEl = document.getElementById('loading');
    const progressBar = document.querySelector('.loader-progress');
    if (!loadingEl) return null;

    let simLoad = 0;
    const loadInterval = setInterval(() => {
        simLoad += Math.random() * 15;
        if (simLoad >= 100) {
            simLoad = 100;
            clearInterval(loadInterval);
            setTimeout(() => loadingEl.classList.add('hidden'), 500);
        }
        if (progressBar) progressBar.style.width = simLoad + '%';
    }, 100);

    return { destroy: () => clearInterval(loadInterval) };
}

function initMouseTracking() {
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    return {
        update: () => {
            mouseX += (targetX - mouseX) * 0.05;
            mouseY += (targetY - mouseY) * 0.05;
            return { mouseX, mouseY };
        }
    };
}

function updateHUD(mouseX, mouseY, cameraZ) {
    const coords = { x: 'coord-x', y: 'coord-y', z: 'coord-z' };
    const values = { x: mouseX.toFixed(3), y: mouseY.toFixed(3), z: cameraZ.toFixed(3) };

    Object.entries(coords).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = values[key];
    });
}

/* ========================================
   THREE.JS - CRIAÇÃO DE OBJETOS
======================================== */

function createStarTexture(color = 'rgba(226, 209, 177, 0.4)') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.2, 'white');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

function createStarField(count = 18000, color = 'rgba(226, 209, 177, 0.4)') {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2500;
        sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 4.0,
        map: createStarTexture(color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8,
        sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
}

function createCore(type = 'icosahedron', color = 0xe2d1b1, size = 1.5) {
    const geometries = {
        dodecahedron: () => new THREE.DodecahedronGeometry(size, 0),
        icosahedron: () => new THREE.IcosahedronGeometry(size, 2)
    };

    const geometry = geometries[type] ? geometries[type]() : geometries.icosahedron();
    const material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });

    return new THREE.Mesh(geometry, material);
}

function createParticleRing(color = 0xff6b9d, count = 200) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 0.5;
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
}

function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 3000);
    camera.position.z = 0.1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

/* ========================================
   GSAP ANIMATIONS
======================================== */

function setupScrollAnimations(camera, core, particles = null) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.5,
            onUpdate: (self) => {
                const entropyEl = document.getElementById('entropy');
                if (entropyEl) entropyEl.textContent = (self.progress * 100).toFixed(1);
            }
        }
    });

    timeline
        .to(camera.position, { z: 150, ease: "power1.inOut" }, 0)
        .to(core.rotation, { y: Math.PI * 1.5, x: Math.PI * 0.5, ease: "none" }, 0)
        .to(core.scale, { x: 0.008, y: 0.008, z: 0.008, ease: "power4.in" }, 0)
        .to(core.material, { opacity: 0.8, ease: "power2.in" }, 0);

    if (particles) {
        timeline.to(particles.rotation, { y: -Math.PI * 2, ease: "none" }, 0);
    }

    return timeline;
}

function setupCardAnimations(selector = '.poetic-content, .content-card') {
    gsap.utils.toArray(selector).forEach((card) => {
        const handleMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((centerX - x) / centerX) * 10;

            gsap.to(card, {
                duration: 0.3,
                rotateX,
                rotateY,
                transformPerspective: 1000,
                ease: "power2.out"
            });
        };

        const handleLeave = () => {
            gsap.to(card, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: "power2.out"
            });
        };

        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
    });

    gsap.utils.toArray(selector).forEach((card) => {
        gsap.to(card, {
            opacity: 1,
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 20%",
                scrub: true
            }
        });

        const button = card.querySelector('.return-button');
        if (button) {
            gsap.to(button, {
                opacity: 1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 50%",
                    end: "top 20%",
                    scrub: 1.5
                }
            });
        }
    });
}

/* ========================================
   CLASSE PRINCIPAL
======================================== */

class ContentPageApp {
    constructor() {
        this.pageType = this.detectPageType();
        this.config = CONFIG.pages[this.pageType];
        this.init();
    }

    detectPageType() {
        const body = document.body;
        for (let className of body.classList) {
            if (className.startsWith('page-')) {
                return className.replace('page-', '');
            }
        }
        return 'experiencias';
    }

    init() {
        gsap.registerPlugin(ScrollTrigger);
        initLoadingScreen();

        const mouseTracker = initMouseTracking();
        const { scene, camera, renderer } = setupScene();

        const starField = createStarField(CONFIG.global.starCount, this.config.accentRgba);
        scene.add(starField);

        const core = createCore(this.config.geometry, this.config.accent, CONFIG.global.coreSize);
        scene.add(core);

        let particles = null;
        if (this.config.hasParticles) {
            particles = createParticleRing(this.config.accent, CONFIG.global.particleCount);
            scene.add(particles);
        }

        setupScrollAnimations(camera, core, particles);
        setupCardAnimations();

        const animate = () => {
            const { mouseX, mouseY } = mouseTracker.update();

            starField.rotation.x = mouseY * 0.05;
            starField.rotation.y = mouseX * 0.05 + CONFIG.global.starFieldRotation;

            core.rotation.y += this.config.rotation.y + mouseX * 0.001;
            core.rotation.x += this.config.rotation.x + mouseY * 0.001;

            if (particles) {
                particles.rotation.y += CONFIG.global.particleRotation;
                const time = Date.now() * 0.001;
                const scale = 1 + Math.sin(time) * 0.1;
                particles.scale.set(scale, scale, scale);
            }

            updateHUD(mouseX, mouseY, camera.position.z);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        document.body.style.opacity = '0';
        window.addEventListener('load', () => {
            gsap.to(document.body, { opacity: 1, duration: 1 });
        });

        animate();
    }
}

// Inicializar
new ContentPageApp();