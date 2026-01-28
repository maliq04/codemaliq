'use client'

import { useEffect, useRef } from 'react'
import { HTMLProps } from 'react'

interface AnimateCounterProps extends HTMLProps<HTMLSpanElement> {
  total: number
}

const AnimateCounter = ({ total, ...rest }: AnimateCounterProps) => {
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const count = countRef.current
    if (!count) return

    let startTime: number | null = null
    const duration = 1000 // 1 second
    const startValue = 0
    const endValue = total

    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut)
      
      count.textContent = currentValue.toString()
      
      if (progress < 1) {
        requestAnimationFrame(animateValue)
      }
    }

    requestAnimationFrame(animateValue)
  }, [total])

  return <span {...rest} ref={countRef} data-testid="counter">0</span>
}

export default AnimateCounter
