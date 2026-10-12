export async function apiRequest<T = { message: string }>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    ...(body
      ? {
          headers: isForm ? undefined : { "Content-Type": "application/json" },
          body: isForm ? body : JSON.stringify(body),
        }
      : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Permintaan belum berhasil.");
  return result as T;
}
