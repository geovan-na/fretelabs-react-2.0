// utils/roles.js

export const USER_ROLES = {
    EMBARCADOR: 'embarcador',
    FROTA: 'frota',
    AUTONOMO: 'autonomo',
    VINCULADO: 'vinculado',
    ADMIN: 'admin'
};

export const getRoleFromUser = (user) => {
    if (!user) return null;
    
    if (user.isAdmin) return USER_ROLES.ADMIN;
    if (user.tipo === 'embarcador') return USER_ROLES.EMBARCADOR;
    if (user.tipo === 'frota') return USER_ROLES.FROTA;
    if (user.tipo === 'autonomo') return USER_ROLES.AUTONOMO;
    if (user.tipo === 'vinculado') return USER_ROLES.VINCULADO;
    
    return null;
};

export const getDashboardRoute = (role) => {
    switch(role) {
        case USER_ROLES.EMBARCADOR:
            return '/dashboard/embarcador';
        case USER_ROLES.FROTA:
            return '/dashboard/frota';
        case USER_ROLES.AUTONOMO:
            return '/dashboard/autonomo';
        case USER_ROLES.VINCULADO:
            return '/dashboard/vinculado';
        case USER_ROLES.ADMIN:
            return '/dashboard/admin';
        default:
            return '/dashboard';
    }
};

export const getSidebarLinks = (role) => {
    const commonLinks = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Meus Fretes', path: '/dashboard/fretes' },
        { label: 'Rastreamento', path: '/dashboard/rastreamento' },
        { label: 'Financeiro', path: '/dashboard/financeiro' },
        { label: 'Avaliacoes', path: '/dashboard/avaliacoes' },
        { label: 'Perfil', path: '/dashboard/perfil' },
        { label: 'Configuracoes', path: '/dashboard/configuracoes' }
    ];

    const roleSpecificLinks = {
        [USER_ROLES.EMBARCADOR]: [
            { label: 'Publicar Frete', path: '/dashboard/fretes/novo' }
        ],
        [USER_ROLES.FROTA]: [
            { label: 'Meus Veiculos', path: '/dashboard/veiculos' },
            { label: 'Meus Motoristas', path: '/dashboard/motoristas' }
        ],
        [USER_ROLES.AUTONOMO]: [
            { label: 'Meu Veiculo', path: '/dashboard/veiculos' }
        ],
        [USER_ROLES.VINCULADO]: [],
        [USER_ROLES.ADMIN]: [
            { label: 'Usuarios', path: '/dashboard/usuarios' },
            { label: 'Documentos', path: '/dashboard/documentos' },
            { label: 'Relatorios', path: '/dashboard/relatorios' },
            { label: 'Blacklist', path: '/dashboard/blacklist' }
        ]
    };

    return [...commonLinks, ...(roleSpecificLinks[role] || [])];
};

export const hasPermission = (userRole, requiredRole) => {
    const roleHierarchy = {
        [USER_ROLES.ADMIN]: 5,
        [USER_ROLES.EMBARCADOR]: 4,
        [USER_ROLES.FROTA]: 3,
        [USER_ROLES.AUTONOMO]: 2,
        [USER_ROLES.VINCULADO]: 1
    };
    
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};