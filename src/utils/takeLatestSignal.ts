// "Take latest" cancellation for search-as-you-type: each call aborts the previous request.
// Create ONE instance per fetch action, at module scope, and pass the signal to its request.
export const createTakeLatestSignal = () => {
  let controller: AbortController | null = null

  return (): AbortSignal => {
    controller?.abort()
    controller = new AbortController()
    return controller.signal
  }
}
