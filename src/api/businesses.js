import api from './axios'

export const getBusinesses = (params) =>
  api.get('/businesses', { params })

export const getBusiness = (id) => api.get(`/businesses/${id}`)
export const getBusinessById = (id) => api.get(`/businesses/${id}`)

export const createBusiness = (data) => api.post('/businesses', data)
export const updateBusiness = (id, data) => api.put(`/businesses/${id}`, data)

export const uploadImages = (id, files) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return api.post(`/businesses/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const verifyBusiness = (id) =>
  api.put(`/admin/businesses/${id}/verify`, { is_verified: true })

export const featureBusiness = (id, featured) =>
  api.put(`/admin/businesses/${id}/featured`, { is_featured: featured })

export const deleteBusiness = (id) =>
  api.delete(`/admin/businesses/${id}`)

export const uploadBusinessImage = (id, formData) =>
  api.post(`/businesses/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getStats = () => api.get('/admin/stats')

export const getCategories = () => api.get('/categories')
