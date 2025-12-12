'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Equipamentos', 
    href: '/equipamentos',
    submenu: [
      { name: 'Linha Smart', href: '/equipamentos/linha-smart' },
      { name: 'Linha Robótica', href: '/equipamentos/linha-robotica' },
      { name: 'Linha Clássica', href: '/equipamentos/linha-classica' },
      { name: 'Acessórios GRIPS', href: '/equipamentos/acessorios-grips' },
      { name: 'Cardio', href: '/equipamentos/cardio' },
      { name: 'Peso Livre', href: '/equipamentos/peso-livre' },
    ]
  },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Parceiros', href: '/parceiros' },
  { name: 'Contato', href: '/contato' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  
  const { items, openCart } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Top bar */}
      <div className="bg-neutral-900 text-white py-2 text-sm hidden lg:block border-b border-neutral-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+551832211234" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>(18) 3221-1234</span>
            </a>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Desde 1969 fabricando campeões</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/equipamentosipiranga" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-neutral-950/95 backdrop-blur-lg shadow-lg py-3' : 'bg-neutral-950 py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-400 transition-colors">
                <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white leading-none">IPIRANGA</span>
                <span className="block text-xs text-neutral-500 uppercase tracking-wider">Fitness Equipment</span>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative" onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)} onMouseLeave={() => setActiveSubmenu(null)}>
                  <Link href={item.href} className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${isActive(item.href) ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}`}>
                    {item.name}
                    {item.submenu && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                  </Link>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.submenu && activeSubmenu === item.name && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 pt-2 w-56">
                        <div className="bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 py-2 overflow-hidden">
                          {item.submenu.map((subitem) => (
                            <Link key={subitem.name} href={subitem.href} className={`block px-4 py-2.5 text-sm transition-colors ${pathname === subitem.href ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-3">
              {/* Carrinho */}
              <button onClick={openCart} className="relative p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors" aria-label="Abrir carrinho">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* CTA Desktop */}
              <Link href="/equipamentos" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-lg transition-colors">
                Solicitar Cotação
              </Link>

              {/* Mobile menu button */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors" aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
                {isMobileMenuOpen ? (
                  <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-neutral-900 border-t border-neutral-800 overflow-hidden">
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link href={item.href} className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(item.href) ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 hover:bg-neutral-800'}`} onClick={() => !item.submenu && setIsMobileMenuOpen(false)}>
                        {item.name}
                      </Link>
                      {item.submenu && (
                        <button onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)} className="p-3 text-neutral-400">
                          <svg className={`w-5 h-5 transition-transform ${activeSubmenu === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                    </div>

                    {/* Submenu mobile */}
                    <AnimatePresence>
                      {item.submenu && activeSubmenu === item.name && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-4 space-y-1 overflow-hidden">
                          {item.submenu.map((subitem) => (
                            <Link key={subitem.name} href={subitem.href} className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${pathname === subitem.href ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`} onClick={() => setIsMobileMenuOpen(false)}>
                              {subitem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="pt-4">
                  <Link href="/equipamentos" className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Solicitar Cotação
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
