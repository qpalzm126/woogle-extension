/**
 * API Service
 * 使用TypeScript管理所有与后端服务器的API通信
 */

// 定义接口和类型
interface AuthResponse {
  token: string
  user?: UserInfo
}

interface UserInfo {
  id: string
  username: string
  email?: string
  role?: string
}

interface QueryResult {
  definition?: string
  examples?: string[]
  translations?: Record<string, string>
  relatedTerms?: string[]
  [key: string]: any // 允许其他可能的字段
}

interface QueryHistoryItem {
  id: string
  text: string
  result: QueryResult
  url: string
  title: string
  timestamp: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
  limit: number
}

interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  timeout?: number
}

class ApiService {
  private baseUrl: string
  private token: string | null

  constructor() {
    // API基础URL，实际使用时替换为你的服务器地址
    this.baseUrl = 'https://taas.tcgm.tw'
    this.token = null

    // 初始化时从存储中获取令牌
    this.initToken()
  }

  /**
   * 初始化令牌
   */
  private async initToken(): Promise<void> {
    try {
      const data = await chrome.storage.local.get(['authToken'])
      if (data.authToken) {
        this.token = data.authToken
      }
    } catch (error) {
      console.error('初始化令牌失败:', error)
    }
  }

  /**
   * 设置认证令牌
   * @param token - 认证令牌
   */
  public async setToken(token: string): Promise<void> {
    this.token = token
    await chrome.storage.local.set({ authToken: token })
  }

  /**
   * 清除认证令牌
   */
  public async clearToken(): Promise<void> {
    this.token = null
    await chrome.storage.local.remove('authToken')
  }

  /**
   * 检查是否已经登录
   * @returns 登录状态
   */
  public isLoggedIn(): boolean {
    return !!this.token
  }

  /**
   * 构建请求头
   * @returns 包含认证信息的请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * 发送HTTP请求
   * @param endpoint - API端点
   * @param options - 请求选项
   * @returns 响应数据
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: this.getHeaders(),
      ...options,
    }

    if (options.body && typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, fetchOptions)

      // 处理响应
      if (!response.ok) {
        if (response.status === 401) {
          // 未授权，可能是令牌过期
          await this.clearToken()
          throw new Error('认证失败，请重新登录')
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `请求失败: ${response.status}`)
      }

      // 返回JSON数据
      return (await response.json()) as T
    } catch (error) {
      console.error(`API请求失败 (${endpoint}):`, error)
      throw error
    }
  }

  /**
   * 用户登录
   * @param username - 用户名
   * @param password - 密码
   * @returns 用户信息和令牌
   */
  public async login(username: string, password: string): Promise<AuthResponse> {
    console.log('login')
    try {
      const data = await this.request<AuthResponse>('/auth', {
        method: 'POST',
        body: { username, password },
      })

      if (data.token) {
        await this.setToken(data.token)
        await chrome.storage.local.set({
          isLoggedIn: true,
          username: data.user?.username || username,
          userId: data.user?.id,
        })
      }
      chrome.runtime.sendMessage({ action: 'enableContextMenu' })
      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户注册
   * @param userData - 用户注册数据
   * @returns 用户信息
   */
  public async register(userData: {
    username: string
    password: string
    email?: string
    [key: string]: any
  }): Promise<UserInfo> {
    return await this.request<UserInfo>('/auth/register', {
      method: 'POST',
      body: userData,
    })
  }

  /**
   * 用户登出
   */
  public async logout(): Promise<void> {
    try {
      if (this.token) {
        // 可选：通知服务器登出
        await this.request<{ success: boolean }>('/auth/logout', {
          method: 'POST',
        }).catch(() => {})
      }

      // 无论服务器响应如何，都清除本地存储
      await this.clearToken()
      await chrome.storage.local.set({ isLoggedIn: false })
      await chrome.storage.local.remove(['username', 'userId'])
    } catch (error) {
      console.error('登出错误:', error)
      // 确保本地状态被清除，即使服务器请求失败
      await this.clearToken()
      await chrome.storage.local.set({ isLoggedIn: false })
      await chrome.storage.local.remove(['username', 'userId'])
    }
  }

  /**
   * 验证当前令牌是否有效
   * @returns 令牌是否有效
   */
  public async validateToken(): Promise<boolean> {
    if (!this.token) return false

    try {
      const data = await this.request<{ valid: boolean }>('/auth/validate')
      return !!data.valid
    } catch (error) {
      await this.clearToken()
      await chrome.storage.local.set({ isLoggedIn: false })
      return false
    }
  }

  /**
   * 查询文本
   * @param text - 要查询的文本
   * @returns 查询结果
   */
  public async queryText(text: string): Promise<QueryResult> {
    if (!this.isLoggedIn()) {
      throw new Error('需要登录才能使用查询功能')
    }

    return await this.request<QueryResult>('/query', {
      method: 'POST',
      body: { text },
    })
  }

  /**
   * 获取用户查询历史
   * @param page - 页码
   * @param limit - 每页数量
   * @returns 查询历史数据
   */
  public async getQueryHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<QueryHistoryItem>> {
    return await this.request<PaginatedResponse<QueryHistoryItem>>(
      `/user/history?page=${page}&limit=${limit}`,
    )
  }

  /**
   * 保存查询结果到收藏夹
   * @param queryData - 查询数据
   * @returns 保存的收藏记录
   */
  public async saveToFavorites(queryData: {
    text: string
    result: QueryResult
    url: string
    title: string
    timestamp: string
  }): Promise<QueryHistoryItem> {
    return await this.request<QueryHistoryItem>('/user/favorites', {
      method: 'POST',
      body: queryData,
    })
  }

  /**
   * 获取用户信息
   * @returns 用户信息
   */
  public async getUserProfile(): Promise<UserInfo> {
    return await this.request<UserInfo>('/user/profile')
  }

  /**
   * 更新用户信息
   * @param userData - 要更新的用户数据
   * @returns 更新后的用户信息
   */
  public async updateUserProfile(userData: Partial<UserInfo>): Promise<UserInfo> {
    return await this.request<UserInfo>('/user/profile', {
      method: 'PUT',
      body: userData,
    })
  }

  /**
   * 更改用户密码
   * @param currentPassword - 当前密码
   * @param newPassword - 新密码
   * @returns 操作成功状态
   */
  public async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>('/user/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
  }

  /**
   * 获取用户收藏列表
   * @param page - 页码
   * @param limit - 每页数量
   * @returns 收藏列表
   */
  public async getFavorites(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<QueryHistoryItem>> {
    return await this.request<PaginatedResponse<QueryHistoryItem>>(
      `/user/favorites?page=${page}&limit=${limit}`,
    )
  }

  /**
   * 删除收藏项
   * @param favoriteId - 收藏项ID
   * @returns 操作成功状态
   */
  public async deleteFavorite(favoriteId: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/user/favorites/${favoriteId}`, {
      method: 'DELETE',
    })
  }
}

// 创建单例实例，以便在整个扩展中共享
const apiService = new ApiService()

// 导出API服务实例
export default apiService
