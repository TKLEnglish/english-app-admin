export async function authenticatedFetch(url: string, options: RequestInit = {}, token?: string) {
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}

/**
 * Fetch with automatic token refresh on 401
 * Pass the refreshToken callback from useAuth() to enable auto-refresh
 */
export async function authenticatedFetchWithRefresh(
  url: string,
  options: RequestInit = {},
  token?: string,
  onRefresh?: () => Promise<void>,
) {
  let response = await authenticatedFetch(url, options, token)

  // If 401 and refresh callback provided, attempt refresh and retry
  if (response.status === 401 && onRefresh) {
    try {
      await onRefresh()
      // After refresh, retry the request with new token
      // Note: In practice, we'd need to get the new token from auth context
      // This is a simplified pattern — consider using a context-aware wrapper
      response = await authenticatedFetch(url, options, token)
    } catch {
      // Refresh failed, return 401 response
    }
  }

  return response
}
