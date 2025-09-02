'use client'

import { CONTACT } from '@/lib/constants'

export default function MobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary-600 text-white z-50 shadow-lg">
      <a
        href={`tel:${CONTACT.phone}`}
        className="flex items-center justify-center py-3 px-4 hover:bg-primary-700 transition-colors duration-200"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          className="mr-2"
        >
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span className="font-semibold">Appelez maintenant</span>
      </a>
    </div>
  )
}