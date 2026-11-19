import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
    // Safety net so a stuck request (e.g. a slow AI call) ends with an error instead of spinning forever.
    timeout: 120000,
    timeoutErrorMessage: 'The request took too long. Please try again.',
})

export default api;