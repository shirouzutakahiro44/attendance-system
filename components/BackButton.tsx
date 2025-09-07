'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export default function BackButton({ 
  href = '/', 
  label = 'ホームへ戻る',
  className = '' 
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-button hover:text-accent transition-colors ${className}`}
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}