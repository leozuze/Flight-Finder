import { useEffect, useRef, useState } from "react"

// Keeps a "still loading" flag true for a short tail after the real loading
// state flips to false, so the step checklist doesn't look like it got cut
// off the instant the response arrives — it gets a moment to read as "done".
export function useDelayedLoading(loading, tailMs = 700) {
  const [showLoading, setShowLoading] = useState(loading)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (loading) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setShowLoading(true)
    } else {
      timeoutRef.current = setTimeout(() => setShowLoading(false), tailMs)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [loading, tailMs])

  return showLoading
}