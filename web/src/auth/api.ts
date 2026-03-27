const API_URL = '/api/v1'

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

  async saveRoute(token: string, destination: string, hopsData: string, isPublic: boolean = false, artThumbnail?: string) {
    const response = await fetch(`${API_URL}/routes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination, hops_data: hopsData, is_public: isPublic, art_thumbnail: artThumbnail }),
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

  async shareRoute(token: string, destination: string, hopsData: string, isPublic: boolean = false, artThumbnail?: string) {
    const response = await fetch(`${API_URL}/routes/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ destination, hops_data: hopsData, is_public: isPublic, art_thumbnail: artThumbnail }),
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

  async clearNewItems(token: string) {
    const response = await fetch(`${API_URL}/me/collection/clear-new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to clear new items')
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

  async getBadges(token: string) {
    const response = await fetch(`${API_URL}/me/badges`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get badges')
    }
    return response.json()
  },

  async checkBadges(token: string) {
    const response = await fetch(`${API_URL}/me/badges/check`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to check badges')
    }
    return response.json()
  },
}

// Gallery API
export const galleryApi = {
  async getGallery(page: number = 1, limit: number = 12, sort: string = 'latest') {
    const response = await fetch(`${API_URL}/gallery?page=${page}&limit=${limit}&sort=${sort}`)
    if (!response.ok) {
      throw new Error('Failed to get gallery')
    }
    return response.json()
  },

  async getRandomRoutes(limit: number = 6) {
    const response = await fetch(`${API_URL}/gallery/random?limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to get random routes')
    }
    return response.json()
  },

  async getPublicProfile(username: string) {
    const response = await fetch(`${API_URL}/user/${username}`)
    if (!response.ok) {
      throw new Error('Failed to get profile')
    }
    return response.json()
  },

  async getUserRoutes(username: string, page: number = 1, limit: number = 12, sort: string = 'latest') {
    const response = await fetch(`${API_URL}/user/${username}/routes?page=${page}&limit=${limit}&sort=${sort}`)
    if (!response.ok) {
      throw new Error('Failed to get user routes')
    }
    return response.json()
  },

  async likeRoute(token: string, routeId: number) {
    const response = await fetch(`${API_URL}/routes/${routeId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to like route')
    }
    return response.json()
  },

  async getLikeStatus(token: string, routeId: number) {
    const response = await fetch(`${API_URL}/routes/${routeId}/like/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get like status')
    }
    return response.json()
  },

  async updateVisibility(token: string, routeId: number, isPublic: boolean) {
    const response = await fetch(`${API_URL}/routes/${routeId}/visibility`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_public: isPublic }),
    })
    if (!response.ok) {
      throw new Error('Failed to update visibility')
    }
    return response.json()
  },

  async incrementView(routeId: number) {
    const response = await fetch(`${API_URL}/routes/${routeId}/view`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to increment view')
    }
    return response.json()
  },

  async reportRoute(token: string, routeId: number, reason: string) {
    const response = await fetch(`${API_URL}/routes/${routeId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    })
    if (!response.ok) {
      throw new Error('Failed to report route')
    }
    return response.json()
  },
}