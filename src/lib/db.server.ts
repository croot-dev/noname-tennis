import 'server-only'
import { neon, Pool } from '@neondatabase/serverless'

// Neon serverless SQL client
export const sql = neon(process.env.DATABASE_URL!)

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const DB_RETRY_MAX_ATTEMPTS = 3
const DB_RETRY_BASE_DELAY_MS = 150

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false
  }

  const e = err as {
    message?: string
    code?: string
    cause?: unknown
    sourceError?: unknown
  }

  const message = (e.message || '').toLowerCase()
  const code = (e.code || '').toUpperCase()

  if (
    message.includes('fetch failed') ||
    message.includes('econnreset') ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'UND_ERR_CONNECT_TIMEOUT'
  ) {
    return true
  }

  return hasRetryableError(e.cause) || hasRetryableError(e.sourceError)
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  label: string = 'db operation',
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= DB_RETRY_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const retryable = hasRetryableError(error)

      if (!retryable || attempt === DB_RETRY_MAX_ATTEMPTS) {
        throw error
      }

      const delay = DB_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
      console.warn(
        `[DB Retry] ${label} failed (attempt ${attempt}/${DB_RETRY_MAX_ATTEMPTS}), retrying in ${delay}ms`,
      )
      await sleep(delay)
    }
  }

  throw lastError
}
