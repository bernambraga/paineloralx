export const LINKS = [
    {
        to: '/home',
        name: 'Home',
        allowedGroups: ['Geral'],
    },
    {
        to: '/admin',
        name: 'Admin',
        allowedGroups: ['SuperAdmin'],
    },
    {
        to: '/comercial',
        name: 'Comercial',
        allowedGroups: ['Comercial','SuperAdmin', 'Admin'],
        sublinks:[
            {to:'/comercial/geral',name:'Geral'},
            {to:'/comercial/dentistas',name:'Dentistas'},
            // {to:'/comercial/ranking',name:'Ranking'},
            {to:'/comercial/top15',name:'Top 15'},
        ],
    },
    {
        allowedGroups: ['SAC','SuperAdmin', 'Admin'],
        to: '/sac',
        name: 'SAC',
    },
    {
        allowedGroups: ['SuperAdmin', 'Admin'],
        to: '/bots',
        name: 'Bots',
    },
    {
        allowedGroups: ['SuperAdmin', 'Admin'],
        to: '/senhas',
        name: 'Senhas',
    },
    {
        allowedGroups: ['SuperAdmin', 'Admin'],
        to: '/modelos',
        name: 'Modelos',
    },
]