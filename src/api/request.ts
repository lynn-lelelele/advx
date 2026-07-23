/**
 * Echo API 请求封装
 * 基于 uni.request，自动注入 baseUrl
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

interface RequestOptions<T = UniApp.RequestData> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: T
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
      success: (res) => {
        const result = res.data as ApiResponse<T>
        if (res.statusCode === 200 && result.code === 0) {
          resolve(result)
        } else {
          reject(result)
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

export const api = {
  get<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'GET', data })
  },
  post<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'POST', data })
  },
  put<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'PUT', data })
  },
  del<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'DELETE', data })
  },
}

export default api
