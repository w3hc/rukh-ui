/**
 * Shared context types and formatting helpers.
 * The Rukh API only exposes `name` and `description` publicly (GET /context);
 * everything else (files, links, size) requires the context password.
 */

export type { ContextSummary as RukhContext } from './api'

/** Format a size given in KB (as returned by the Rukh API) into a readable string. */
export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
