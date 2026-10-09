export type CollectionStatus = 'syncing' | 'ready'

export interface Collection {
  id: string
  name: string
  description: string
  status: CollectionStatus
  bookCount: number
}

export interface CreateCollectionInput {
  name: string
  description: string
}
