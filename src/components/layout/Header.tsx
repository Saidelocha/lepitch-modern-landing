'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { CONTACT } from '@/lib/constants'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { headerTheme } = useHeaderTheme()

  const menuItems = [
    { href: '#methode', label: 'La Méthode' },
    { href: '#resultats', label: 'Résultats' },
    { href: '#offres', label: 'Nos Offres' },
    { href: '#temoignages', label: 'Témoignages' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      headerTheme === 'white' 
        ? 'bg-white shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container relative z-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo 
              variant="full" 
              theme={headerTheme === 'white' ? 'dark' : 'light'}
              className="h-8 lg:h-10 w-auto transition-all duration-300 hover:scale-105"
              width={160}
              height={40}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  headerTheme === 'white' 
                    ? 'text-gray-700 hover:text-primary-600' 
                    : 'text-white/90 hover:text-primary-400 drop-shadow-sm'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-md transition-colors duration-200 ${
              headerTheme === 'white' 
                ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100' 
                : 'text-white/90 hover:text-primary-400'
            }`}
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <nav className={`lg:hidden py-4 border-t rounded-b-2xl shadow-lg animate-fade-in-down ${
            headerTheme === 'white' 
              ? 'border-neutral-200/50 bg-white/95 backdrop-blur-lg' 
              : 'border-white/20 bg-black/30 backdrop-blur-lg'
          }`}>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium animate-fade-in-up ${
                    headerTheme === 'white' 
                      ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50' 
                      : 'text-white/90 hover:text-primary-400 hover:bg-white/10'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={CONTACT.bookingUrl}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 font-semibold text-center animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
              >
                Audit Gratuit
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}