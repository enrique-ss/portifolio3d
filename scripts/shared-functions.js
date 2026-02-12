/* ========================================
   FUNÇÕES JAVASCRIPT COMPARTILHADAS
======================================== */

// ===== LOADING SCREEN =====
export function initLoadingScreen() {
    let loadProgress = 0;
    const loadingEl = document.getElementById('loading');
    const progressBar = document.querySelector('.loader-progress');

    function updateProgress(progress) {
        loadProgress = progress;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progress >= 100 && loadingEl) {
            setTimeout(() => {
                loadingEl.classList.add('hidden');
            }, 500);
        }
    }

    let simLoad = 0;
    const loadInterval = setInterval(() => {
        simLoad += Math.random() * 15;
        if (simLoad >= 100) {
            simLoad = 100;
            clearInterval(loadInterval);
        }
        updateProgress(simLoad);
    }, 100);

    return { updateProgress };
}

// ===== MOUSE TRACKING =====
export function initMouseTracking() {
    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function updateMouse() {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        return { mouseX, mouseY };
    }

    return { updateMouse, getTargetMouse: () => ({ targetMouseX, targetMouseY }) };
}

// ===== UPDATE HUD COORDINATES =====
export function updateHUDCoords(mouseX, mouseY, cameraZ) {
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const coordZ = document.getElementById('coord-z');

    if (coordX) coordX.textContent = mouseX.toFixed(3);
    if (coordY) coordY.textContent = mouseY.toFixed(3);
    if (coordZ) coordZ.textContent = cameraZ.toFixed(3);
}

// ===== THREE.JS STAR TEXTURE =====
export function createStarTexture(color = 'rgba(226, 209, 177, 0.4)') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
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

    return new THREE.CanvasTexture(canvas);
}

// ===== CREATE STAR FIELD =====
export function createStarField(starCount = 18000, color = 'rgba(226, 209, 177, 0.4)') {
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
        map: createStarTexture(color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8,
        sizeAttenuation: true
    });

    return new THREE.Points(starsGeometry, starsMaterial);
}

// ===== CREATE CORE MESH =====
export function createCore(geometryType = 'icosahedron', color = 0xe2d1b1, size = 1.5) {
    let geometry;

    switch (geometryType) {
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(size, 0);
            break;
        case 'icosahedron':
        default:
            geometry = new THREE.IcosahedronGeometry(size, 2);
            break;
    }

    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });

    return new THREE.Mesh(geometry, material);
}

// ===== CREATE PARTICLE RING =====
export function createParticleRing(color = 0xff6b9d, particleCount = 200) {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = [];

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 0.5;
        particlesPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    return new THREE.Points(particlesGeometry, particlesMaterial);
}

// ===== SETUP BASIC SCENE =====
export function setupBasicScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.01,
        3000
    );
    camera.position.z = 0.1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}

// ===== WINDOW RESIZE HANDLER =====
export function handleWindowResize(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== SETUP CARD 3D TILT EFFECT =====
export function setupCard3DTilt(selector = '.poetic-content, .content-card') {
    gsap.utils.toArray(selector).forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((centerX - x) / centerX) * 10;

            gsap.to(card, {
                duration: 0.3,
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: "power2.out"
            });
        });
    });
}

// ===== SETUP SCROLL ANIMATIONS FOR CARDS =====
export function setupScrollAnimations(selector = '.poetic-content, .content-card') {
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

// ===== SETUP SCROLL TIMELINE FOR CAMERA =====
export function setupScrollTimeline(camera, core, coreMat, particles = null) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.5,
            onUpdate: (self) => {
                const entropyEl = document.getElementById('entropy');
                if (entropyEl) {
                    entropyEl.textContent = (self.progress * 100).toFixed(1);
                }
            }
        }
    });

    timeline
        .to(camera.position, { z: 150, ease: "power1.inOut" }, 0)
        .to(core.rotation, { y: Math.PI * 1.5, x: Math.PI * 0.5, ease: "none" }, 0)
        .to(core.scale, { x: 0.008, y: 0.008, z: 0.008, ease: "power4.in" }, 0)
        .to(coreMat, { opacity: 0.8, ease: "power2.in" }, 0);

    if (particles) {
        timeline.to(particles.rotation, { y: -Math.PI * 2, ease: "none" }, 0);
    }

    return timeline;
}