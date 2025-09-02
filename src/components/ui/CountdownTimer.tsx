'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  onExpire?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        onExpire?.()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onExpire])

  const formatTime = (value: number) => value.toString().padStart(2, '0')

  return (
    <div className="flex items-center justify-center gap-1 text-sm font-mono">
      <div className="bg-danger-600 text-white px-2 py-1 rounded">
        {formatTime(timeLeft.hours)}
      </div>
      <span className="text-danger-600">:</span>
      <div className="bg-danger-600 text-white px-2 py-1 rounded">
        {formatTime(timeLeft.minutes)}
      </div>
      <span className="text-danger-600">:</span>
      <div className="bg-danger-600 text-white px-2 py-1 rounded">
        {formatTime(timeLeft.seconds)}
      </div>
    </div>
  )
}