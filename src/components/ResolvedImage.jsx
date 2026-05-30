import { useState, useEffect, useMemo } from 'react'
import { resolveImageUrl, isS3MediaConfigured } from '../services/s3Media'

// Only use as img src if it's a real URL (no raw S3 keys — those go through Identity Pool)
function isDisplayableUrl(value) {
  if (!value || typeof value !== 'string') return false
  return /^(https?:|blob:|data:|\/[^/])/.test(value.trim())
}

/** Invisible 1×1 GIF — valid img src while Cognito+GetObject runs (avoids loading then aborting the API URL). */
const PLACEHOLDER_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * Renders an img with src from S3 via Cognito Identity Pool (GetObject → blob URL).
 * Uses s3Key or fallbackUrl when it is a raw key (non-http). External http(s) URLs use fallback only.
 */
export default function ResolvedImage({
  s3Key,
  fallbackUrl,
  alt = '',
  className,
  onError,
  style,
  ...imgProps
}) {
  const [resolvedUrl, setResolvedUrl] = useState(null)
  const keyToResolve = useMemo(() => {
    if (!isS3MediaConfigured) return null
    const k = s3Key && String(s3Key).trim()
    if (k) return k
    const f = fallbackUrl && String(fallbackUrl).trim()
    if (f && !isDisplayableUrl(f)) return f
    return null
  }, [s3Key, fallbackUrl])

  const [loading, setLoading] = useState(!!keyToResolve)

  /** When Identity Pool is off (tests/local), non-http fallbacks are plain img paths, not S3 keys. */
  const useLiteralFallback =
    Boolean(fallbackUrl?.trim()) &&
    ((!keyToResolve && !isS3MediaConfigured) || isDisplayableUrl(fallbackUrl))

  useEffect(() => {
    if (!s3Key && !fallbackUrl) {
      setResolvedUrl(null)
      setLoading(false)
      return
    }

    if (keyToResolve) {
      setLoading(true)
      setResolvedUrl(null)
      resolveImageUrl(keyToResolve, null)
        .then((url) => {
          setResolvedUrl(url || null)
          setLoading(false)
        })
        .catch(() => {
          setResolvedUrl(null)
          setLoading(false)
        })
      return
    }

    const f = fallbackUrl && String(fallbackUrl).trim()
    if (!f) {
      setResolvedUrl(null)
    } else if (!isS3MediaConfigured || isDisplayableUrl(f)) {
      setResolvedUrl(f)
    } else {
      setResolvedUrl(null)
    }
    setLoading(false)
  }, [s3Key, fallbackUrl, keyToResolve])

  const trimmedFallback = fallbackUrl && String(fallbackUrl).trim()
  const src =
    loading && keyToResolve
      ? PLACEHOLDER_SRC
      : resolvedUrl ||
        (useLiteralFallback && trimmedFallback ? trimmedFallback : '')

  if (!src && !loading) return null

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      style={loading && keyToResolve ? { opacity: 0.6, ...style } : style}
      {...imgProps}
    />
  )
}
