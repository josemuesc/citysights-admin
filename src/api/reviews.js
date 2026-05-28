import api from './axios'

export const getReviews = (params) => api.get('/reviews', { params })
export const getReview = (id) => api.get(`/reviews/${id}`)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)
export const updateReviewStatus = (id, status) =>
  api.patch(`/reviews/${id}/status`, { status })
