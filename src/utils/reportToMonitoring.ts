// Stand-in for a monitoring service. Never use console.error directly in stores or components.
//
// Not called `reportError`: that is also a DOM global (window.reportError), so forgetting the
// import would silently call the global and rethrow instead of logging, with no type error.
export const reportToMonitoring = (error: unknown, extra?: Record<string, unknown>) => {
  console.debug('[monitoring]', error, extra)
}
