import { useEffect, useState } from 'react'

interface SplitLayoutProps {
  wheelOrReveal: React.ReactNode  // wheel picker OR reveal screen
  chat: React.ReactNode           // persistent chat interface
}

/**
 * Responsive split-page layout that adapts to viewport aspect ratio.
 * - Portrait (height > width): horizontal split (top = wheel/reveal, bottom = chat)
 * - Landscape (width >= height): vertical split (left = wheel/reveal, right = chat)
 */
export default function SplitLayout({ wheelOrReveal, chat }: SplitLayoutProps) {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)

    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateRows: isPortrait ? '1fr 1fr' : '1fr',
        gridTemplateColumns: isPortrait ? '1fr' : '1fr 1fr',
      }}
    >
      {wheelOrReveal}
      {chat}
    </div>
  )
}
