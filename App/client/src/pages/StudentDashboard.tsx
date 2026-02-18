import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, CheckCircle, Clock } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    description: string;
    period: string;
    capacity: number;
    enrolled: number;
    owner: { name: string };
}

interface Enrollment {
    id: number;
    folio: string;
    project: Project;
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [registration, setRegistration] = useState<{ timeSlot: string } | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [validationCode, setValidationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [regRes, enrollRes, projRes] = await Promise.all([
                api.get('/fair/my').catch(() => ({ data: null })),
                api.get('/enrollments/my').catch(() => ({ data: [] })),
                api.get('/projects').catch(() => ({ data: [] }))
            ]);

            setRegistration(regRes.data);
            if (enrollRes.data && enrollRes.data.length > 0) {
                setEnrollment(enrollRes.data[0]); // Assuming 1 enrollment for now
            }
            setProjects(projRes.data);
        } catch (e) {
            console.error("Error fetching data", e);
        }
    };

    const handleRegisterSlot = async (slot: string) => {
        try {
            await api.post('/fair/register', { timeSlot: slot });
            fetchInitialData();
        } catch (e) {
            alert("Error registering time slot (Full?)");
        }
    };

    const handleEnroll = async () => {
        if (!selectedProject) return;
        setError('');
        try {
            const res = await api.post('/enrollments/confirm', {
                projectId: selectedProject.id,
                validationCode
            });
            setSuccess('Enrolled successfully! Folio: ' + res.data.folio);
            setValidationCode('');
            setSelectedProject(null);
            fetchInitialData();
        } catch (e: any) {
            setError(e.response?.data?.error || "Enrollment failed");
        }
    };

    if (!registration) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Registro a la Feria de Servicio Social</h2>
                <p className="mb-6 text-gray-600">Selecciona tu horario de asistencia para ver los proyectos.</p>
                <div className="grid grid-cols-3 gap-4">
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(slot => (
                        <button
                            key={slot}
                            onClick={() => handleRegisterSlot(slot)}
                            className="p-3 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 font-medium"
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Bar */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Horario Feria: {registration.timeSlot}</span>
                </div>

                {enrollment ? (
                    <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 font-bold border border-green-200 mt-2 md:mt-0">
                        PROYECTO INSCRITO: {enrollment.project.name} (Folio: {enrollment.folio})
                    </div>
                ) : (
                    <div className="bg-yellow-100 px-4 py-2 rounded-full text-yellow-800 border border-yellow-200 mt-2 md:mt-0">
                        PENDIENTE DE INSCRIPCIÓN
                    </div>
                )}
            </div>

            {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <p className="text-green-700 font-bold">{success}</p>
                </div>
            )}

            {/* Projects */}
            {!enrollment && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Proyectos Disponibles</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar proyecto..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects
                            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                            .map(project => (
                                <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border border-gray-100 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg text-indigo-900 line-clamp-2">{project.name}</h4>
                                        <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{project.period}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-grow">{project.description}</p>
                                    <div className="mt-4 flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-700">{project.owner.name}</span>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${project.enrolled >= project.capacity ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {project.enrolled} / {project.capacity}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        disabled={project.enrolled >= project.capacity}
                                        className={`mt-4 w-full py-2 rounded font-medium transition-colors ${project.enrolled >= project.capacity
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {project.enrolled >= project.capacity ? 'Cupo Lleno' : 'Inscribirse'}
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-2">Confirmar Inscripción</h3>
                        <p className="text-gray-600 mb-4">Estás a punto de inscribirte a <strong>{selectedProject.name}</strong>.</p>
                        <p className="text-sm text-gray-500 mb-4">Por favor ingresa el código proporcionado por el Socio Formador.</p>

                        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

                        <input
                            type="text"
                            value={validationCode}
                            onChange={(e) => setValidationCode(e.target.value)}
                            placeholder="CÓDIGO SECRETO"
                            className="w-full border p-3 rounded mb-4 font-mono text-center text-lg uppercase tracking-widest"
                        />

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => { setSelectedProject(null); setError(''); setValidationCode(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEnroll}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
