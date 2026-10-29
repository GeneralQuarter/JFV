type Result = 'Success' | 'AuthError' | 'Error';

export function authenticatedApiCall(
  relPath: string,
  password: string,
  options: RequestInit,
): Promise<Result> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}${relPath}`, {
    headers: {
      Authorization: `Basic ${btoa(`jfv:${password}`)}`,
      'Content-Type': 'application/json',
    },
    ...options,
  })
    .then((res) =>
      res.ok ? 'Success' : res.status === 401 ? 'AuthError' : 'Error',
    )
    .catch(() => Promise.resolve('Error'));
}
