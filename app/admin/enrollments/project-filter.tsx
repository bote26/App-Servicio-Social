'use client';

interface Project {
  id: number;
  titulo: string;
  claveProyecto: string;
}

interface Props {
  projects: Project[];
  selectedProjectId: number | null;
  count: number;
}

export default function ProjectFilter({ projects, selectedProjectId, count }: Props) {
  return (
    <form method="GET" className="flex items-center gap-4">
      <label className="text-sm text-gray-600 font-medium">Filtrar por proyecto:</label>
      <select
        name="proyecto"
        defaultValue={selectedProjectId ?? ''}
        className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[280px]"
        onChange={(e) => {
          const form = e.target.closest('form') as HTMLFormElement;
          form?.submit();
        }}
      >
        <option value="">Todos los proyectos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.claveProyecto} — {p.titulo}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-500">
        {count} inscripción{count !== 1 ? 'es' : ''}
      </span>
    </form>
  );
}
