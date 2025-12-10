import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const BackButton: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
  )
}