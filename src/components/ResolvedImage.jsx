import { useState, useEffect } from 'react'
import { resolveImageUrl, isS3MediaConfigured } from '../services/s3Media'

// Only use as img src if it's a real URL (no presigned URLs anymore – frontend uses Identity Pool only)
function isDisplayableUrl(value) {
  if (!value || typeof value !== 'string') return false
  return /^(https?:|blob:|data:)\//.test(value.trim())
}

/**
 * Renders an img with src from S3 via Cognito Identity Pool (no presigned URLs).
 * Uses s3Key or fallbackUrl (when it's an external http/https URL).
 */
export default function ResolvedImage({
  s3Key,
  fallbackUrl,
  alt = '',
  className,
  onError,
  ...imgProps
}) {
  const [resolvedUrl, setResolvedUrl] = useState(null)
  const [loading, setLoading] = useState(!!(s3Key && isS3MediaConfigured))

  useEffect(() => {
    if (!s3Key && !fallbackUrl) {
      setResolvedUrl(null)
      setLoading(false)
      return
    }
    if ((s3Key || fallbackUrl) && isS3MediaConfigured) {
      const key = s3Key || (isDisplayableUrl(fallbackUrl) ? null : fallbackUrl)
      if (key) {
        setLoading(true)
        resolveImageUrl(key, null).then((url) => {
          setResolvedUrl(url || null)
          setLoading(false)
        }).catch(() => {
          setResolvedUrl(null)
          setLoading(false)
        })
      } else {
        setResolvedUrl(isDisplayableUrl(fallbackUrl) ? fallbackUrl : null)
        setLoading(false)
      }
    } else {
      setResolvedUrl(isDisplayableUrl(fallbackUrl) ? fallbackUrl : null)
      setLoading(false)
    }
  }, [s3Key, fallbackUrl])

  const src = resolvedUrl || (isDisplayableUrl(fallbackUrl) ? fallbackUrl : '')
  if (!src && !loading) return null

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      style={loading ? { opacity: 0.6 } : undefined}
      {...imgProps}
    />
  )
}
