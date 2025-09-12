import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern - sadece bir instance oluştur
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Helper function to handle auth errors and clear invalid sessions
const handleAuthErrorInternal = async (error: any) => {
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found') ||
      error?.code === 'invalid_refresh_token') {
    console.log('Invalid refresh token detected, clearing session...')
    
    try {
      // Force clear the session from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.removeItem('supabase.auth.token')
        
        // Clear all supabase keys from localStorage
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }
    } catch (clearError) {
      console.warn('Error clearing storage, but continuing...', clearError)
    }
    
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
  return error
}

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            try {
              return localStorage.getItem(key)
            } catch {
              return null
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(key, value)
            } catch {
              // Ignore storage errors
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(key)
            } catch {
              // Ignore storage errors
            }
          }
        }
      },
      // Add global error handler
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    })
    
    // Add global error handling for auth errors
    const originalGetSession = supabaseInstance.auth.getSession
    supabaseInstance.auth.getSession = async function() {
      try {
        return await originalGetSession.call(this)
      } catch (error: any) {
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found')) {
          await handleAuthErrorInternal(error)
          return { data: { session: null }, error: null }
        }
        throw error
      }
    }
  }
  return supabaseInstance
})()

// Helper function to handle auth errors and clear invalid sessions
export const handleAuthError = async (error: any) => {
  return handleAuthErrorInternal(error)
}

// Function to completely clear auth state
export const clearAuthState = () => {
  if (typeof window === 'undefined') return
  
  try {
    // Clear specific auth tokens
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.removeItem('supabase.auth.token')
    
    // Clear all supabase keys from localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
    
    console.log('Auth state cleared successfully')
  } catch (error) {
    console.warn('Error clearing auth state:', error)
  }
}

// Function to check if we have a potentially invalid session
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Enhanced auth function with error handling
export const safeAuthCall = async <T>(authFunction: () => Promise<T>): Promise<T | null> => {
  try {
    return await authFunction()
  } catch (error: any) {
    await handleAuthError(error)
    return null
  }
}

// Database types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  image1?: string
  image2?: string
  image3?: string
  image4?: string
  category_id: number
  brand_id: number
  is_featured: boolean
  order_number: number
  quantity: number
  usage_instructions?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  created_at: string
  updated_at: string
  order: number
}

export interface Brand {
  id: number
  name: string
  image?: string
  created_at: string
  updated_at: string
  order: number
}



export interface Blog {
  id: number
  title: string
  sub_title: string
  description: string
  order: number
  is_featured: boolean
  image?: string
  created_add: string
}

export interface ReactionType {
  id: number
  name: string
  display_name: string
  icon: string
  color: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface BlogReaction {
  id: number
  blog_id: number
  user_id: string
  reaction_type_id: number
  created_at: string
}

export interface Comment {
  id: number
  created_at: string
  user_id: number
  article_id: number
  comment: string
  user_name?: string // Optional field for display purposes
  profiles?: {
    full_name?: string
    email?: string
  }
}

export interface Banner {
  id: number
  title: string
  sub_title: string
  image?: string
  add_button: boolean
  btn_text?: string
  add_link?: string
  created_at: string
  start_date: string
  end_date: string
}

export interface Order {
  id: number
  created_at: string
  products: string // JSON string containing product IDs and quantities
  status_id: number // Foreign key to status table
  total: number
  currency: string
  user: string // UUID of the user
  appointment_date?: string // Randevu tarihi
}

export interface OrderProduct {
  product_id: number
  quantity: number
  price: number
}

export interface Status {
  id: number
  name: string
  display_name: string
  description?: string
  color: string
  icon: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Admin {
  id: number
  user_id: string // auth.users.id ile ilişkili
  role_id: number
  roles?: Role // İlişkili rol bilgisi
}

export interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  role_permissions?: RolePermission[]
}

export interface Permission {
  id: number
  name: string
  display_name: string
  description?: string
  module: string
  is_active: boolean
  created_at: string
}

export interface RolePermission {
  id: number
  role_id: number
  permission_id: number
  permissions?: Permission
}

export interface Order {
  id: number
  order_number: string
  user_id?: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  
  // Müşteri Bilgileri
  customer_name: string
  customer_email: string
  customer_phone?: string
  
  // Teslimat Adresi
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code: string
  shipping_country: string
  
  // Fatura Adresi
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  
  // Fiyat Bilgileri
  subtotal: number
  tax_amount: number
  shipping_cost: number
  discount_amount: number
  total_amount: number
  
  // Ödeme Bilgileri
  payment_method?: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_reference?: string
  
  // Notlar
  customer_notes?: string
  admin_notes?: string
  
  // Tarihler
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  
  // İlişkili veriler
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  
  // Ürün bilgileri
  product_name: string
  product_sku?: string
  product_image?: string
  
  // Fiyat ve miktar
  unit_price: number
  quantity: number
  total_price: number
  
  created_at: string
  
  // İlişkili ürün
  products?: Product
}

export interface OrderStatusHistory {
  id: number
  order_id: number
  status: string
  notes?: string
  created_by?: string
  created_at: string
}

// Helper function to get product image URL
export const getProductImageUrl = (imageName: string) => {
  if (!imageName) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+'

  // Resim adını temizle ve encode et
  const cleanImageName = encodeURIComponent(imageName.trim())
  return `${supabaseUrl}/storage/v1/object/public/products-images/${cleanImageName}`
}

// Helper function to check if image exists
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Helper function to get blog image URL
export const getBlogImageUrl = (imageName: string) => {
  if (!imageName) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+'
  return `${supabaseUrl}/storage/v1/object/public/blogs-images/${imageName}`
}

// Helper function to get brand image URL
export const getBrandImageUrl = (imageName: string) => {
  if (!imageName) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9UT0NQQVA8L3RleHQ+PC9zdmc+'
  return `${supabaseUrl}/storage/v1/object/public/brands-images/${imageName}`
}

// Helper function to get banner image URL
export const getBannerImageUrl = (imageName: string) => {
  if (!imageName) return ''
  return `${supabaseUrl}/storage/v1/object/public/banner-images/${imageName}`
}