import { useEffect, useState, useRef } from 'react'

export function useMediaStream() {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        setStream(mediaStream)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error accessing media devices:', err)
      } finally {
        setIsLoading(false)
      }
    }

    getMediaStream()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return { stream, error, isLoading }
}

export function useVideoRef() {
  const videoRef = useRef(null)

  const setVideoStream = (stream) => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }

  return { videoRef, setVideoStream }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export function generateMeetingCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateUserId() {
  return `user_${Math.random().toString(36).substring(2, 11)}`
}
