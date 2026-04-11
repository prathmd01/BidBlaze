
import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'seller' | 'admin'
  avatar_url?: string
  bio?: string
  website?: string
  business_name?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  kyc_status?: 'pending' | 'verified' | 'rejected'
}

interface AuthContextType {
  user: User | null
  signUp: (email: string, password: string, name: string, role?: 'user' | 'seller', phone?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string, role?: 'user' | 'seller') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // Clear token if auth check fails
        localStorage.removeItem('auth-token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth-token')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: 'user' | 'seller' = 'user', phone?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: role === 'user' ? name : undefined,
          business_name: role === 'seller' ? name : undefined,
          phone,
          role
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('auth-token', data.token)
        }
        setUser(data.user)
        return { error: null }
      } else {
        return { error: data.message || 'Registration failed' }
      }
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  const signIn = async (email: string, password: string, role: 'user' | 'seller' = 'user') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('auth-token', data.token)
        }
        setUser(data.user)
        return { error: null }
      } else {
        return { error: data.message || 'Login failed' }
      }
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  const signOut = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      localStorage.removeItem('auth-token')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('auth-token')
      setUser(null)
    }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
