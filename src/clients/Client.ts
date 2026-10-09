// Base class for every domain client. Maps HTTP failures to typed errors.
// Domain clients live next to the view that uses them (views/<view>/api/); only this base class is global.
import * as api from 'app/utils/apiClient'
import type { ApiError, ApiResponse, RequestConfig } from 'app/utils/apiClient'

export class ClientError extends Error {
  response?: { status: number; data: unknown }

  constructor(error: unknown) {
    super(error instanceof Error ? error.message : 'Unknown client error')
    this.name = 'ClientError'
    this.response = (error as ApiError | undefined)?.response
  }
}

export class BadRequestError extends ClientError {
  constructor(error: unknown) {
    super(error)
    this.name = 'BadRequestError'
  }
}

export class ForbiddenError extends ClientError {
  constructor(error: unknown) {
    super(error)
    this.name = 'ForbiddenError'
  }
}

export class ResourceNotFoundError extends ClientError {
  constructor(error: unknown) {
    super(error)
    this.name = 'ResourceNotFoundError'
  }
}

export class ResourceValidationError extends ClientError {
  constructor(error: unknown) {
    super(error)
    this.name = 'ResourceValidationError'
  }
}

export abstract class Client {
  static bindToUser = api.bindToUser
  static isCancel = api.isCancel

  static get<T>(url: string, config?: RequestConfig) {
    return Client.makeRequest(() => api.get<T>(url, config))
  }

  static post<T>(url: string, config?: RequestConfig) {
    return Client.makeRequest(() => api.post<T>(url, config))
  }

  static put<T>(url: string, config?: RequestConfig) {
    return Client.makeRequest(() => api.put<T>(url, config))
  }

  static patch<T>(url: string, config?: RequestConfig) {
    return Client.makeRequest(() => api.patch<T>(url, config))
  }

  static delete<T>(url: string, config?: RequestConfig) {
    return Client.makeRequest(() => api.del<T>(url, config))
  }

  protected static async makeRequest<T>(run: () => Promise<ApiResponse<T>>) {
    try {
      return await run()
    } catch (error) {
      // Cancelled requests are not failures: callers decide what to do with them.
      if (Client.isCancel(error)) throw error

      switch ((error as ApiError).response?.status) {
        case 400:
          throw new BadRequestError(error)
        case 403:
          throw new ForbiddenError(error)
        case 404:
          throw new ResourceNotFoundError(error)
        case 422:
          throw new ResourceValidationError(error)
        default:
          throw new ClientError(error)
      }
    }
  }
}
