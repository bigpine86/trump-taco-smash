import React, { useEffect, useRef } from 'react'

// Extend Window interface for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdSenseProps {
  client: string
  slot: string
  format?: string
  responsive?: boolean
  className?: string
}

const AdSense: React.FC<AdSenseProps> = ({ 
  className = '', 
  slot, 
  format = 'auto',
  responsive = true 
}) => {
  const adRef = useRef<HTMLModElement>(null)
  const isAdLoaded = useRef(false)

  useEffect(() => {
    if (isAdLoaded.current) return
    
    try {
      if (window.adsbygoogle && !adRef.current?.getAttribute('data-ad-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        isAdLoaded.current = true
      }
    } catch (error) {
      console.log('AdSense error:', error)
    }
  }, [])

  return (
    <div className={className}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense client ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  )
}

export default AdSense