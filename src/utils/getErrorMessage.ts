import { ClientError } from 'app/clients/Client'

// Prefers the message sent by the server, then the error message, then a generic text.
export const getErrorMessage = (error: unknown) => {
  if (error instanceof ClientError) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Unknown error'
}
