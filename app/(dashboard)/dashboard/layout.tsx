'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, Activity, Menu, Calendar, FileText, ClipboardList, CheckCircle } from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/dashboard') {
      router.push('/dashboard/general');
    }
  }, [pathname, router]);

  const navItems = [
    { href: '/dashboard/general', icon: Settings, label: 'Mi Perfil' },
    { href: '/dashboard/fair-registration', icon: ClipboardList, label: 'Registro Feria' },
    { href: '/dashboard/projects', icon: Calendar, label: 'Proyectos' },
    { href: '/dashboard/my-enrollments', icon: CheckCircle, label: 'Mis Inscripciones' },
    { href: '/dashboard/activity', icon: Activity, label: 'Actividad' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Mi Panel</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Alternar barra lateral</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${isSidebarOpen ? 'block' : 'hidden'
            } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            <div className="mb-4 px-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estudiante
              </h2>
            </div>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`shadow-none my-1 w-full justify-start ${pathname === item.href ? 'bg-gray-100' : ''
                    }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
