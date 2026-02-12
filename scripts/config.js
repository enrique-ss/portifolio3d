/* ========================================
   CONFIGURAÇÃO UNIVERSAL DO SITE
======================================== */

export const CONFIG = {
    // Configurações de páginas - tudo em um objeto
    pages: {
        experiencias: {
            accent: 0xff6b9d,
            accentRgba: 'rgba(255, 107, 157, 0.4)',
            name: 'EXPERIÊNCIAS',
            geometry: 'dodecahedron',
            hasParticles: true,
            rotation: { y: 0.0018, x: 0.0012 }
        },
        formacao: {
            accent: 0x4ecca3,
            accentRgba: 'rgba(78, 204, 163, 0.4)',
            name: 'FORMAÇÃO',
            geometry: 'icosahedron',
            hasParticles: false,
            rotation: { y: 0.0015, x: 0.0005 }
        },
        projetos: {
            accent: 0xfbbf24,
            accentRgba: 'rgba(251, 191, 36, 0.4)',
            name: 'PROJETOS',
            geometry: 'icosahedron',
            hasParticles: false,
            rotation: { y: 0.0015, x: 0.0005 }
        },
        index: {
            accent: 0xe2d1b1,
            accentRgba: 'rgba(226, 209, 177, 0.4)',
            name: 'PORTFÓLIO'
        }
    },

    // Módulos da página index
    indexModules: [
        {
            name: 'Formação',
            filename: 'education.db',
            description: 'Minha jornada acadêmica: Licenciatura em Computação, cursos complementares e certificações que moldaram meu conhecimento.',
            url: 'formacao.html',
            position: { x: -8, y: 4, z: -3 },
            color: 0x4ecca3
        },
        {
            name: 'Experiências',
            filename: 'experience.log',
            description: 'Projetos profissionais, trabalhos desenvolvidos e experiências que contribuíram para minha formação como desenvolvedor.',
            url: 'experiencias.html',
            position: { x: 7, y: -3, z: 5 },
            color: 0xff6b9d
        },
        {
            name: 'Projetos',
            filename: 'projects.json',
            description: 'Portfólio completo de aplicações web, sistemas e experimentos criativos desenvolvidos ao longo da minha jornada.',
            url: 'projetos.html',
            position: { x: -5, y: -5, z: 8 },
            color: 0xfbbf24
        }
    ],

    // Configurações globais
    global: {
        starCount: 18000,
        starFieldRotation: 0.0002,
        particleRotation: -0.0005,
        particleCount: 200,
        coreSize: 1.5
    }
};

// ===== EXPORTS PARA COMPATIBILIDADE =====
// O index.js usa a importação antiga, então exportamos separadamente
export const INDEX_MODULES = CONFIG.indexModules;
export const PAGE_COLORS = CONFIG.pages;
export const GEOMETRY_CONFIG = {
    experiencias: {
        type: CONFIG.pages.experiencias.geometry,
        hasParticles: CONFIG.pages.experiencias.hasParticles
    },
    formacao: {
        type: CONFIG.pages.formacao.geometry,
        hasParticles: CONFIG.pages.formacao.hasParticles
    },
    projetos: {
        type: CONFIG.pages.projetos.geometry,
        hasParticles: CONFIG.pages.projetos.hasParticles
    }
};
export const ANIMATION_CONFIG = {
    coreRotation: {
        experiencias: CONFIG.pages.experiencias.rotation,
        formacao: CONFIG.pages.formacao.rotation,
        projetos: CONFIG.pages.projetos.rotation,
        default: { y: 0.0015, x: 0.0005 }
    },
    starFieldRotation: CONFIG.global.starFieldRotation,
    particleRotation: CONFIG.global.particleRotation
};
export const SCROLL_CONFIG = {
    default: {
        minHeight: '1000vh'
    },
    experiencias: {
        minHeight: '200vh'
    }
};