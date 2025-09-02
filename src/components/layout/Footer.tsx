import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { CONTACT } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-white pt-12 lg:pt-16 pb-4 lg:pb-6 relative z-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
          {/* Company Info */}
          <div>
            <Logo 
              variant="full" 
              className="mb-4"
              width={180}
              height={50}
            />
            <p className="text-neutral-600 leading-relaxed">
              Transformez votre prise de parole en arme de persuasion massive
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-neutral-900">Contact</h4>
            <div className="space-y-2">
              <Link
                href={`tel:${CONTACT.phone}`}
                className="block text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                {CONTACT.phone}
              </Link>
              <Link
                href={`mailto:${CONTACT.email}`}
                className="block text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                {CONTACT.email}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-neutral-900">Légal</h4>
            <div className="space-y-2">
              <Link
                href="/mentions-legales"
                className="block text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                Mentions légales
              </Link>
              <Link
                href="/cgv"
                className="block text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                CGV
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-200 pt-8 pb-2 text-center">
          <p className="text-neutral-600">
            &copy; 2024 Le Pitch Qu'il Vous Faut. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}