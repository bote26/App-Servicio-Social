'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, Apple, PlayCircle, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { TecLogo, MiTecLogo } from '@/components/tec-logo';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 login-overlay" />

      {/* Top Header */}
      <header className="relative z-20 w-full flex justify-between items-center px-4 py-4 md:px-12 md:py-6">
        <TecLogo className="w-48 md:w-64 h-auto" white={true} />

        <div className="hidden md:flex items-center gap-4 text-white/80">
          <Apple size={18} className="cursor-pointer hover:text-white" />
          <PlayCircle size={18} className="cursor-pointer hover:text-white" />
          <Twitter size={18} className="cursor-pointer hover:text-white" />
          <Facebook size={18} className="cursor-pointer hover:text-white" />
          <Instagram size={18} className="cursor-pointer hover:text-white" />
          <Youtube size={18} className="cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <MiTecLogo className="mb-8 scale-110" />

          <form action={formAction} className="w-full space-y-4">
            <input type="hidden" name="redirect" value={redirect || ''} />

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                <User size={18} />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                className="w-full h-11 pl-12 pr-4 bg-white/90 backdrop-blur-sm border-none rounded-full text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400"
                placeholder={mode === 'signin' ? "A0166354" : "Email"}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                defaultValue={state.password}
                required
                className="w-full h-11 pl-12 pr-4 bg-white/90 backdrop-blur-sm border-none rounded-full text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400"
                placeholder="••••••••••••"
              />
            </div>

            {state?.error && (
              <div className="text-red-400 text-xs text-center font-medium bg-black/20 py-1 rounded-md">{state.error}</div>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 login-btn-gradient text-white font-semibold text-lg rounded-full shadow-lg shadow-blue-500/20"
            >
              {pending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                mode === 'signin' ? 'Ingresar' : 'Registrarse'
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-2 text-[10px] md:text-xs text-white/90 font-medium tracking-wider uppercase">
            <Link href="#" className="hover:underline">¿OLVIDASTE TU CONTRASEÑA?</Link>
            <Link href="#" className="hover:underline">¿NECESITAS AYUDA? CONTÁCTANOS</Link>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${redirect ? `?redirect=${redirect}` : ''}`}
              className="text-xs text-white/70 hover:text-white underline transition-colors"
            >
              {mode === 'signin' ? 'Crear una cuenta' : 'Ya tengo una cuenta'}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full flex flex-col md:flex-row justify-between items-center px-4 py-6 md:px-12 text-[10px] md:text-xs text-white font-medium tracking-wide">
        <div className="flex gap-4 mb-2 md:mb-0">
          <Link href="#" className="hover:underline uppercase">AVISO DE PRIVACIDAD</Link>
          <Link href="#" className="hover:underline uppercase">ETHOS</Link>
        </div>

        <div className="opacity-90">
          © 2026 <span className="text-blue-400 font-bold">Tecnológico de Monterrey.</span>
        </div>
      </footer>
    </div>
  );
}
