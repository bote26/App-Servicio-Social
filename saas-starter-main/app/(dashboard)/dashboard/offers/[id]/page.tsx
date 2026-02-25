'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Users,
    Calendar,
    Briefcase,
    Info,
    Star,
    Settings,
    ChevronRight
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { TecLogo, MiTecLogo } from '@/components/tec-logo';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const project = mockProjects.find(p => p.id === id);

    if (!project) {
        notFound();
    }

    return (
        <div className="flex-1 w-full bg-[#f9fafb] min-h-screen">
            {/* Detail Header / Nav Branding Sub-header */}
            <div className="bg-white border-b border-gray-100 px-4 md:px-12 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/offers" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors font-semibold text-sm">
                        <ArrowLeft size={16} /> Catalogo
                    </Link>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                        Favoritos
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-12">
                {/* Title and Logo Area */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div className="flex-1">
                        <h1 className="text-4xl font-extrabold text-[#1a1a1a] leading-tight mb-4">
                            {project.title} <span className="text-pink-600 font-medium ml-2">{project.period}</span>
                        </h1>
                        <p className="text-lg font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            {project.organization}
                        </p>
                        <div className="mt-4 flex gap-2">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 bg-pink-500 text-white text-xs font-bold rounded-lg uppercase shadow-lg shadow-pink-500/10">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-80 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center border border-gray-50 overflow-hidden relative group">
                        <Button variant="ghost" className="absolute top-4 right-4 z-10 size-10 rounded-full bg-gray-50 text-gray-400 hover:text-blue-600 p-0 shadow-sm border border-gray-100">
                            <Star size={18} />
                        </Button>
                        {project.logoUrl ? (
                            <img src={project.logoUrl} alt={project.organization} className="max-h-32 object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="text-6xl font-bold text-gray-100 uppercase">{project.organization.charAt(0)}</div>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Descriptions */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="flex gap-4">
                            <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-tight">Objetivo del Proyecto:</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {project.objective}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-tight">Actividades a realizar</h3>
                            <ul className="space-y-4">
                                {project.activities.map((activity, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-600 font-medium leading-tight">
                                        <span className="text-blue-500 font-bold">{idx + 1}.</span> {activity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Details Card */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Clave Header Card */}
                        <div className="bg-[#f0f4f8] rounded-3xl p-8 flex items-center justify-between border border-blue-50 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-200">
                                    <ChevronRight size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Clave para inscribir este proyecto</span>
                                    <span className="text-2xl font-black text-[#2d3748]">{project.clave}</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Logistics Card */}
                        <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-200/40 border border-gray-100 flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <DetailItem icon={Clock} label="Horario" value={project.schedule} />
                                <DetailItem icon={Settings} label="Competencias requeridas" value={project.competencies.join(', ')} />
                                <DetailItem icon={Users} label="Cupo" value={`${project.capacity} estudiantes`} />
                                <DetailItem icon={Briefcase} label="Modalidad" value={project.modality + ' | Proyecto Solidario Presencial'} />
                                <DetailItem icon={MapPin} label="Lugar de trabajo" value={project.location} />
                                <DetailItem icon={Calendar} label="Duración" value={project.duration} />
                                <DetailItem icon={Users} label="Población que atiende la organización" value={project.targetPopulation} />
                                <DetailItem icon={Clock} label="Horas máximas a acreditar" value={`Hasta ${project.hours} horas`} />
                            </div>
                        </div>

                        {/* Additional Comments */}
                        <div className="bg-gray-50/80 rounded-3xl p-8 border border-gray-100">
                            <h4 className="text-center font-bold text-gray-800 uppercase text-xs tracking-[0.2em] mb-4">Comentarios adicionales</h4>
                            <p className="text-center text-gray-600 font-medium italic">
                                "{project.additionalComments}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex gap-4">
            <Icon className="text-gray-300 shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">{label}:</span>
                <span className="text-sm font-bold text-gray-700 leading-snug">{value}</span>
            </div>
        </div>
    );
}
