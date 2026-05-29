import api from './axios'

export const getReviews = (params) => api.get('/admin/reviews', { params })
export const deleteReview = (id) => api.delete(`/admin/reviews/${id}`)
