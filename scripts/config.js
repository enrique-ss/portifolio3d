/* ========================================
   CONFIGURAÇÕES DAS PÁGINAS
======================================== */

// Configurações de cores para cada página
export const PAGE_COLORS = {
    experiencias: {
        accent: 0xff6b9d,
        accentRgba: 'rgba(255, 107, 157, 0.4)',
        name: 'EXPERIÊNCIAS'
    },
    formacao: {
        accent: 0x4ecca3,
        accentRgba: 'rgba(78, 204, 163, 0.4)',
        name: 'FORMAÇÃO'
    },
    projetos: {
        accent: 0xfbbf24,
        accentRgba: 'rgba(251, 191, 36, 0.4)',
        name: 'PROJETOS'
    },
    index: {
        accent: 0xe2d1b1,
        accentRgba: 'rgba(226, 209, 177, 0.4)',
        name: 'PORTFÓLIO'
    }
};

// Configurações de geometria para cada página
export const GEOMETRY_CONFIG = {
    experiencias: {
        type: 'dodecahedron',
        hasParticles: true
    },
    formacao: {
        type: 'icosahedron',
        hasParticles: false
    },
    projetos: {
        type: 'icosahedron',
        hasParticles: false
    }
};

// Configurações de scroll
export const SCROLL_CONFIG = {
    default: {
        minHeight: '1000vh'
    },
    experiencias: {
        minHeight: '200vh'
    }
};

// Módulos da página index
export const INDEX_MODULES = [
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
];

// Configurações de animação
export const ANIMATION_CONFIG = {
    coreRotation: {
        experiencias: { y: 0.0018, x: 0.0012 },
        formacao: { y: 0.0015, x: 0.0005 },
        projetos: { y: 0.0015, x: 0.0005 },
        default: { y: 0.0015, x: 0.0005 }
    },
    starFieldRotation: 0.0002,
    particleRotation: -0.0005
};