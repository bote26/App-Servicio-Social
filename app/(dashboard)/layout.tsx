'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, Settings, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

interface UserData {
  id: number;
  email: string;
  name: string | null;
  matricula: string | null;
  rol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user || !user.id) {
    return (
      <>
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/sign-in">Iniciar Sesión</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Registrarse</Link>
        </Button>
      </>
    );
  }

  const getDashboardLink = () => {
    switch (user.rol) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/admin/validation';
      case 'socioformador':
        return '/socioformador';
      default:
        return '/dashboard';
    }
  };

  const getRoleLabel = () => {
    switch (user.rol) {
      case 'admin':
        return 'Administrador';
      case 'staff':
        return 'Personal';
      case 'socioformador':
        return 'Socioformador';
      default:
        return 'Estudiante';
    }
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2">
          <Avatar className="cursor-pointer size-9">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {(user.name || user.email || 'U')
                .split(' ')
                .map((n) => n?.[0] || '')
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">{user.name || user.email || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{getRoleLabel()}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href={getDashboardLink()} className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Panel de control</span>
          </Link>
        </DropdownMenuItem>
        {user.rol === 'admin' && (
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/admin" className="flex w-full items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Administración</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard/general" className="flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">Servicio Social</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {children}
    </section>
  );
}
