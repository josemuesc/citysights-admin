import api from './axios'

export const login = (credentials) => api.post('/auth/login', credentials)
export const me = () => api.get('/auth/me')
