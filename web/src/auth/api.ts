const API_URL = 'http://localhost:8000/api/v1'

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  async register(username: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    return response.json()
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }
    return response.json()
  },

  async getMe(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get user info')
    }
    return response.json()
  },
}

export const routesApi = {
  async getRoutes(token: string) {
    const response = await fetch(`${API_URL}/routes`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get routes')
    }
    return response.json()
  },

  async saveRoute(token: string, destination: string, hopsData: string) {
    const response = await fetch(`${API_URL}/routes`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination, hops_data: hopsData }),
    })
    if (!response.ok) {
      throw new Error('Failed to save route')
    }
    return response.json()
  },

  async deleteRoute(token: string, routeId: number) {
    const response = await fetch(`${API_URL}/routes/${routeId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to delete route')
    }
    return response.json()
  },

  async getRoute(token: string, routeId: number) {
    const response = await fetch(`${API_URL}/routes/${routeId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get route')
    }
    return response.json()
  },

  async shareRoute(token: string, destination: string, hopsData: string) {
    const response = await fetch(`${API_URL}/routes/share`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination, hops_data: hopsData }),
    })
    if (!response.ok) {
      throw new Error('Failed to share route')
    }
    return response.json()
  },

  async getSharedRoute(shareId: string) {
    const response = await fetch(`${API_URL}/share/${shareId}`)
    if (!response.ok) {
      throw new Error('Failed to get shared route')
    }
    return response.json()
  },

  async getCollection(token: string) {
    const response = await fetch(`${API_URL}/me/collection`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get collection')
    }
    return response.json()
  },

  async getCollectionCategory(token: string, category: string) {
    const response = await fetch(`${API_URL}/me/collection/${category}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get collection category')
    }
    return response.json()
  },

  async collectRoute(token: string, destination: string, hopsData: string, fingerprintId: string) {
    const response = await fetch(`${API_URL}/trace/collect`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination, hops_data: hopsData, fingerprint_id: fingerprintId }),
    })
    if (!response.ok) {
      throw new Error('Failed to collect route')
    }
    return response.json()
  },
}
