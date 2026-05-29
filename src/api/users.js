import api from './axios'

export const getUsers = (params) =>
  api.get('/admin/users', { params })

export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role })

export const toggleUserActive = (id) =>
  api.put(`/admin/users/${id}/toggle`)
