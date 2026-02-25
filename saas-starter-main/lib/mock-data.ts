export interface Project {
    id: string;
    title: string;
    organization: string;
    tags: string[];
    clave: string;
    hours: number;
    modality: 'Presencial' | 'Remoto' | 'Híbrido';
    period: string;
    objective: string;
    activities: string[];
    schedule: string;
    competencies: string[];
    capacity: number;
    location: string;
    duration: string;
    targetPopulation: string;
    additionalComments: string;
    logoUrl?: string;
}

export const mockProjects: Project[] = [
    {
        id: 'wa1065',
        title: 'Apoyo en el desarrollo de habilidades de vida independiente para personas con Autismo',
        organization: 'Clínica Mexicana de Autismo y Alteraciones del Desarrollo A.C.',
        tags: ['LPS'],
        clave: 'WA1065 Grupo 101',
        hours: 60,
        modality: 'Presencial',
        period: 'Febrero - Junio',
        objective: 'Lograr el máximo desarrollo y la inclusión de personas con TEA, dando intervención individualizada.',
        activities: [
            'Intervención en personas con TEA.',
            'Acompañamiento en el diseño de programas de independencia.'
        ],
        schedule: 'Lunes a viernes de 9:00 a 14:00 hrs.',
        competencies: ['Trabajo en equipo', 'Comunicación efectiva', 'Resolución de problemas'],
        capacity: 5,
        location: 'Van Dick 66, Colonia Santa María Nonoalco Alcaldía Benito Juárez CDMX',
        duration: '5 semanas',
        targetPopulation: 'Niños, adolescentes y adultos con trastorno del espectro autista',
        additionalComments: 'En CLIMA, estamos comprometidos con la inclusión y el bienestar de las personas con Trastorno del Espectro Autista.',
        logoUrl: 'https://clima.org.mx/wp-content/uploads/2021/03/logo-clima.png'
    },
    {
        id: 'wa1067-404',
        title: 'Programa de Mejora Continua Primaria Níger',
        organization: 'Escuela Primaria Níger',
        tags: ['ICT', 'IDM', 'IRS', 'ITC', 'HCM', 'LC', 'LEI', 'LLE', 'LTM'],
        clave: 'WA1067 Grupo 404',
        hours: 120,
        modality: 'Presencial',
        period: 'Febrero - Junio',
        objective: 'Fortalecer los procesos de enseñanza-aprendizaje y la infraestructura escolar.',
        activities: [
            'Apoyo en regularización académica.',
            'Mantenimiento de áreas comunes.',
            'Talleres extraescolares.'
        ],
        schedule: 'Lunes a jueves de 8:00 a 13:00 hrs.',
        competencies: ['Liderazgo', 'Empatía', 'Organización'],
        capacity: 10,
        location: 'Calle Falsa 123, Col. Centro',
        duration: '16 semanas',
        targetPopulation: 'Estudiantes de primaria',
        additionalComments: 'Se requiere disponibilidad por las mañanas.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Logo_SEP_2018.png'
    },
    {
        id: 'wa1067-403',
        title: 'Apoyando mi aprendizaje y fortalecer mi lectura',
        organization: 'Escuela Primaria de tiempo completo Somalia',
        tags: ['Todas'],
        clave: 'WA1067 Grupo 403',
        hours: 120,
        modality: 'Presencial',
        period: 'Febrero - Junio',
        objective: 'Mejorar el nivel de comprensión lectora en estudiantes de primaria.',
        activities: [
            'Círculos de lectura.',
            'Actividades de ortografía y redacción.',
            'Dinámicas grupales.'
        ],
        schedule: 'Lunes a viernes de 14:00 a 18:00 hrs.',
        competencies: ['Comunicación', 'Paciencia', 'Creatividad'],
        capacity: 8,
        location: 'Av. Somalia 456, Col. Progreso',
        duration: '16 semanas',
        targetPopulation: 'Niños de 1ero a 6to grado',
        additionalComments: 'Ideal para alumnos con gusto por la enseñanza.',
        logoUrl: 'https://somalia.tecresearch.mx/logo.png'
    }
];
