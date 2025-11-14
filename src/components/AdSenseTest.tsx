import React from 'react'

interface AdSenseTestProps {
  className?: string
  slot: string
}

const AdSenseTest: React.FC<AdSenseTestProps> = ({ className = '', slot }) => {
  return (
    <div className={`${className} bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-600 font-mono`}>
      <div className="text-center p-4">
        <div className="text-sm mb-1">AdSense Ad</div>
        <div className="text-xs">Slot: {slot}</div>
        <div className="text-xs">Replace with real AdSense code</div>
      </div>
    </div>
  )
}

export default AdSenseTest