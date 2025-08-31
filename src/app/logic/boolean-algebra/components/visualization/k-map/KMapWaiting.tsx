'use client'

import React from 'react'

export function KMapWaiting() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-md min-h-[15rem]">
      <div className="text-center max-w-md">
        <p className="text-sm">Enter an expression to generate a Karnaugh Map.</p>
        <p className="text-sm mt-2">K-Map generation supports 2 to 5 variables.</p>
      </div>
    </div>
  )
}
