/**
 * Echo API 请求封装
 * 基于 uni.request，自动注入 baseUrl + X-Token
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

/** 全局 Token，所有请求自动携带 */
let authToken = ''

export function setToken(token: string): void {
  authToken = token
}

export function getToken(): string {
  return authToken
}

interface RequestOptions<T = any> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: T
  header?: Record<string, string>
}

function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'X-Token': authToken } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          reject(res.data)
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
