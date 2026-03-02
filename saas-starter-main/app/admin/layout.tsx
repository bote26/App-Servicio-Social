'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, FolderKanban, Calendar, 
  KeyRound, Menu, LogOut, CircleIcon,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import useSWR, { mutate } from 'swr';

interface UserData {
  id: number;
  email: string;
  name: string | null;
  rol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AdminHeader() {
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/sign-in');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/admin" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">Admin Panel</span>
        </Link>
        
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2">
              <Avatar className="size-9">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {user?.name || user?.email}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/general">
                <Settings className="mr-2 h-4 w-4" />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/projects', icon: FolderKanban, label: 'Proyectos' },
    { href: '/admin/events', icon: Calendar, label: 'Eventos' },
    { href: '/admin/codes', icon: KeyRound, label: 'Códigos' },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <AdminHeader />
      </Suspense>

      <div className="flex flex-1">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar */}
        <aside
          className={`w-64 bg-white border-r border-gray-200 lg:block ${
            isSidebarOpen ? 'fixed inset-y-0 left-0 z-40 pt-16' : 'hidden'
          } lg:relative lg:pt-0`}
        >
          <nav className="h-full overflow-y-auto p-4">
            <div className="mb-4 px-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administración
              </h2>
            </div>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href, item.exact) ? 'secondary' : 'ghost'}
                  className={`w-full justify-start my-1 ${
                    isActive(item.href, item.exact) ? 'bg-blue-50 text-blue-700' : ''
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

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
