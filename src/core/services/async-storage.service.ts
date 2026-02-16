import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class AsyncStorageService {
  async query<T>(entityType: string, delay = 100): Promise<T[]> {
    const entities = JSON.parse(localStorage.getItem(entityType) || 'null') || []
    if (delay) {
      return new Promise((resolve) => setTimeout(resolve, delay, entities))
    }
    return entities
  }

  async get<T extends { _id: string }>(entityType: string, entityId: string): Promise<T> {
    const entities = await this.query<T>(entityType)
    const entity = entities.find(e => e._id === entityId)
    if (!entity) throw new Error(`Item ${entityId} of type: ${entityType} not found`)
    return entity
  }

  async post<T>(entityType: string, newEntity: T): Promise<T> {
    const entityWithId = { ...newEntity, _id: this.makeId() }
    const entities = await this.query<T>(entityType)
    entities.push(entityWithId)
    this._save(entityType, entities)
    return entityWithId as T
  }

  private _save<T>(entityType: string, entities: T[]) {
    localStorage.setItem(entityType, JSON.stringify(entities))
  }

  makeId(length = 5): string {
    let txt = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
      txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
  }
}