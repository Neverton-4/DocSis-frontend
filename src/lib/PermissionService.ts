export type PermissaoItem = {
  tela: number
  permissao: string
  nome?: string
  descricao?: string
  ativo?: boolean
}

type Listener = () => void

class PermissionServiceClass {
  private permissions: PermissaoItem[] = []
  private listeners: Set<Listener> = new Set()
  private storageKey = 'user_permissions'
  private screenMap: Record<string, number> = {}
  private screenMapKey = 'screen_map'

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this.permissions = parsed
        }
      }
      const rawMap = localStorage.getItem(this.screenMapKey)
      if (rawMap) {
        const parsedMap = JSON.parse(rawMap)
        if (parsedMap && typeof parsedMap === 'object') {
          this.screenMap = parsedMap
        }
      }
    } catch {}
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.permissions))
      localStorage.setItem(this.screenMapKey, JSON.stringify(this.screenMap))
    } catch {}
  }

  setPermissions(perms: PermissaoItem[]) {
    this.permissions = Array.isArray(perms) ? perms : []
    this.save()
    this.emit()
  }

  list(): PermissaoItem[] {
    return this.permissions
  }

  setScreenMap(map: Record<string, number>) {
    this.screenMap = map || {}
    this.save()
    this.emit()
  }

  resolveTelaId(codigo: string): number | undefined {
    return this.screenMap[codigo]
  }

  canAccessScreenByCode(codigo: string): boolean {
    const id = this.resolveTelaId(codigo)
    if (typeof id !== 'number') return false
    return this.canAccessScreen(id)
  }

  has(codigo: string, telaId?: number): boolean {
    if (!this.permissions || this.permissions.length === 0) return false
    for (const p of this.permissions) {
      if (p.permissao === codigo && (p.ativo !== false)) {
        if (telaId === undefined) return true
        if (p.tela === telaId) return true
      }
    }
    return false
  }

  getName(codigo: string, telaId?: number): string | undefined {
    const found = this.permissions.find(p => {
      if (p.permissao !== codigo || p.ativo === false) return false
      if (telaId === undefined) return true
      return p.tela === telaId
    })
    return found?.nome
  }

  canAccessScreen(telaId: number): boolean {
    return this.has('acesso_tela', telaId)
  }

  onChange(fn: Listener) {
    this.listeners.add(fn)
  }

  offChange(fn: Listener) {
    this.listeners.delete(fn)
  }

  private emit() {
    for (const fn of this.listeners) {
      try { fn() } catch {}
    }
  }
}

export const PermissionService = new PermissionServiceClass()