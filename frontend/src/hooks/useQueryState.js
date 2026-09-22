import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { patchQuery } from '../utils/urlState.js'

export function useQueryState() {
  const location = useLocation()
  const navigate = useNavigate()
  const updateQuery = useCallback((updates, options) => {
    navigate(patchQuery(location, updates), options)
  }, [location, navigate])
  return { location, updateQuery }
}
