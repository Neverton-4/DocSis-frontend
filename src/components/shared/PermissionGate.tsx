import React from 'react'
import { PermissionService } from '@/lib/PermissionService'

type Props = {
  children: React.ReactNode
  codigo: string
  telaId?: number
  mode?: 'hide' | 'disable'
}

export const PermissionGate: React.FC<Props> = ({ children, codigo, telaId, mode = 'hide' }) => {
  const allowed = PermissionService.has(codigo, telaId)
  if (mode === 'hide') {
    if (!allowed) {
      console.warn('[ui-denied]', { codigo, telaId })
      return null
    }
    return <>{children}</>
  }
  if (!allowed) {
    console.warn('[ui-denied]', { codigo, telaId })
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, { disabled: true })
    }
    return <>{children}</>
  }
  return <>{children}</>
}

export default PermissionGate