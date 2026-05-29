import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Menu, X } from 'lucide-react';
import { PrecioLive } from './PrecioLive';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLight = location.pathname.startsWith('/lote/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isLight
            ? 'bg-parchment/92 backdrop-blur-xl shadow-lg'
            : 'bg-void/92 backdrop-blur-xl border-b border-gold-subtle'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Hexagon
              className={`w-7 h-7 transition-colors duration-300 ${
                isLight && !scrolled ? 'text-text-ink' : 'text-volcanic-gold'
              } group-hover:scale-110 transition-transform`}
              strokeWidth={1.5}
            />
            <span
              className={`font-display text-lg tracking-wide transition-colors duration-300 ${
                isLight && !scrolled ? 'text-text-ink' : 'text-text-warm'
              }`}
            >
              Organicode
            </span>
          </Link>

          {/* Center Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-volcanic-gold ${
                  location.pathname === link.to
                    ? 'text-volcanic-gold'
                    : isLight && !scrolled
                    ? 'text-text-ink/70'
                    : 'text-text-sand'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <PrecioLive compact />
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isLight && !scrolled ? 'text-text-ink' : 'text-text-warm'
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/98 backdrop-blur-xl border-t border-gold-subtle">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-volcanic-gold ${
                  location.pathname === link.to ? 'text-volcanic-gold' : 'text-text-sand'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gold-subtle">
              <PrecioLive />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
