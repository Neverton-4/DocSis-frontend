import React from 'react'

type Props = {
  title: string
  subtitle?: string
}

export const DocumentHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  )
}