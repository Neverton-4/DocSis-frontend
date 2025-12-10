import { describe, it, expect, beforeEach } from 'vitest'
import { PermissionService } from '@/lib/PermissionService'

describe('PermissionService', () => {
  beforeEach(() => {
    PermissionService.setPermissions([])
    localStorage.clear()
  })

  it('armazenar e consultar permissões', () => {
    PermissionService.setPermissions([
      { tela: 1, permissao: 'acesso_tela', nome: 'Acesso Protocolo', ativo: true },
      { tela: 2, permissao: 'criar_documento', ativo: true },
    ])
    expect(PermissionService.has('acesso_tela', 1)).toBe(true)
    expect(PermissionService.has('acesso_tela', 2)).toBe(false)
    expect(PermissionService.has('criar_documento', 2)).toBe(true)
    expect(PermissionService.getName('acesso_tela', 1)).toBe('Acesso Protocolo')
  })

  it('persiste no localStorage', () => {
    PermissionService.setPermissions([{ tela: 3, permissao: 'acesso_tela', ativo: true }])
    const saved = localStorage.getItem('user_permissions')
    expect(saved).toBeTruthy()
    PermissionService.setPermissions([])
    PermissionService.load()
    expect(PermissionService.has('acesso_tela', 3)).toBe(false)
  })
})