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
