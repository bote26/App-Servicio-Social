'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, MapPin, ChevronRight, Star, X } from 'lucide-react';
import { mockProjects, Project } from '@/lib/mock-data';

export default function OffersPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = mockProjects.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.organization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 w-full bg-gray-50 min-h-screen p-4 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 px-2">
                Oferta Servicio Social - Febrero - Junio - 2026
            </h1>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-10 px-2">
                <div className="relative flex-1 min-w-[300px] max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        className="pl-12 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-blue-500"
                        placeholder="Buscar proyectos u organizaciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <FilterButton label="Horas" />
                <FilterButton label="Carrera" />
                <FilterButton label="Modalidad" />
                <FilterButton label="Periodo" value="Febrero - Junio" active />

                <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-gray-500">
                    <X size={20} />
                </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}

function FilterButton({ label, value, active = false }: { label: string; value?: string; active?: boolean }) {
    return (
        <Button
            variant="outline"
            className={`h-12 rounded-xl px-5 border-gray-200 shadow-sm font-medium text-sm flex gap-2 items-center hover:bg-white transition-all ${active ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'text-gray-600'
                }`}
        >
            <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
                    <ChevronRight size={10} className="rotate-90" /> {label}
                </span>
                {value && <span className="mt-1">{value}</span>}
            </div>
        </Button>
    );
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[420px] border border-gray-100/50">
            {/* Card Header with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-1/2 pointer-events-none" />

            {/* Favorite Button */}
            <Button variant="ghost" className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none p-0">
                <Star size={18} />
            </Button>

            {/* Tag Overlay */}
            <div className="absolute top-4 left-6 z-10 flex gap-1">
                {project.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full uppercase shadow-lg shadow-pink-500/20">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Top Section / Image Placeholder Area */}
            <div className="h-2/5 bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
                {project.logoUrl ? (
                    <img src={project.logoUrl} alt={project.organization} className="max-h-full max-w-full object-contain relative z-10 mix-blend-multiply" />
                ) : (
                    <div className="text-5xl font-bold text-gray-200 uppercase">{project.organization.charAt(0)}</div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {project.title}
                    </h2>
                    <p className="mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {project.organization}
                    </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="opacity-80">Clave a inscribir: {project.clave}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <Clock size={14} />
                                <span>Hasta {project.hours} Horas</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <MapPin size={14} />
                                <span>{project.modality}</span>
                            </div>
                        </div>

                        <Button asChild className="rounded-full bg-gray-950 text-white hover:bg-blue-600 font-bold px-6 h-9 text-xs transition-all">
                            <Link href={`/dashboard/offers/${project.id}`}>
                                Ver más
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
