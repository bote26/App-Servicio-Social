import { getProjectById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { EditProjectForm } from './edit-form';
import { getSocioformadores } from '../../actions';

export default async function EditProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const projectId = Number(id);
  
  const [project, socioformadores] = await Promise.all([
    getProjectById(projectId),
    getSocioformadores(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <EditProjectForm 
      project={project} 
      socioformadores={socioformadores} 
    />
  );
}
