export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown; error?: unknown } } }).response
    const message = response?.data?.message
    if (Array.isArray(message) && message.length > 0) {
      return String(message[0])
    }
    if (typeof message === 'string' && message.trim()) {
      return message
    }

    const responseError = response?.data?.error
    if (typeof responseError === 'string' && responseError.trim()) {
      return responseError
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
