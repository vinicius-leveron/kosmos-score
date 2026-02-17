/**
 * Error Handling for CRM API
 * Follows RFC 7807 Problem Details format
 */

import type { ApiError } from './types.ts';

export function createError(
  status: number,
  title: string,
  detail: string,
  instance?: string
): ApiError {
  return {
    type: `https://api.kosmos.io/errors/${status}`,
    title,
    status,
    detail,
    instance,
  };
}

export function errorResponse(
  error: ApiError,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify(error), {
    status: error.status,
    headers: {
      ...headers,
      'Content-Type': 'application/problem+json',
    },
  });
}

// Common errors
export const errors = {
  unauthorized: (detail = 'Invalid or missing API key') =>
    createError(401, 'Unauthorized', detail),

  forbidden: (detail = 'You do not have permission to access this resource') =>
    createError(403, 'Forbidden', detail),

  notFound: (resource = 'Resource') =>
    createError(404, 'Not Found', `${resource} not found`),

  methodNotAllowed: (method: string, path: string) =>
    createError(405, 'Method Not Allowed', `${method} is not allowed on ${path}`),

  rateLimited: (retryAfter = 60) =>
    createError(429, 'Too Many Requests', `Rate limit exceeded. Try again in ${retryAfter} seconds`),

  badRequest: (detail: string) =>
    createError(400, 'Bad Request', detail),

  conflict: (detail: string) =>
    createError(409, 'Conflict', detail),

  internalError: (detail = 'An unexpected error occurred') =>
    createError(500, 'Internal Server Error', detail),
};
