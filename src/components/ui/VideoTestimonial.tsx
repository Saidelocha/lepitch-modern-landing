'use client'

import { useState } from 'react'
import Image from 'next/image'

interface VideoTestimonialProps {
  name: string
  role: string
  company: string
  image?: string
  videoUrl?: string
  testimonialText: string
  result: string
}

export default function VideoTestimonial({ 
  name, 
  role, 
  company, 
  image, 
  videoUrl, 
  testimonialText, 
  result 
}: VideoTestimonialProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handlePlayVideo = () => {
    setIsVideoPlaying(true)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
      {/* Video Preview */}
      {videoUrl && !isVideoPlaying && (
        <div className="mb-6 relative">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative overflow-hidden cursor-pointer group" onClick={handlePlayVideo}>
            {image && (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="w-16 h-16 bg-white/90 hover:bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300"
                onClick={handlePlayVideo}
              >
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {videoUrl && isVideoPlaying && (
        <div className="mb-6">
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center mb-4">
        {image && !videoUrl && (
          <Image
            src={image}
            alt={name}
            width={56}
            height={56}
            className="rounded-full ring-2 ring-gray-100"
          />
        )}
        {!image && (
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div className="ml-4">
          <h4 className="font-bold text-gray-900 text-lg">{name}</h4>
          <p className="text-sm text-gray-600 leading-tight">{role}, {company}</p>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">★</span>
        ))}
      </div>
      
      {/* Testimonial Text */}
      <p className="text-gray-700 mb-4 italic text-sm lg:text-base leading-relaxed">
        "{testimonialText}"
      </p>
      
      {/* Result */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
        <p className="text-green-800 font-semibold text-sm flex items-center gap-2">
          💰 {result}
        </p>
      </div>

      {/* Video Badge */}
      {videoUrl && (
        <div className="absolute top-4 right-4 bg-danger-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          🎥 VIDÉO
        </div>
      )}
    </div>
  )
}