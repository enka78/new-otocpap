import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  image1?: string
  image2?: string
  image3?: string
  category_id: number
  brand_id: number
  is_featured: boolean
  stock_number: string
  quantity: number
  usage_instructions?: string
  created_at: string
  updated_at: string
  widget_id?: number
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

export interface Widget {
  id: number
  widget_name: string
  created_at: string
}

export interface Blog {
  id: number
  title: string
  sub_title: string
  description: string
  order: number
  is_featured: boolean
  author: string
  image?: string
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
  return `${supabaseUrl}/storage/v1/object/public/brands/${imageName}`
}

// Helper function to get banner image URL
export const getBannerImageUrl = (imageName: string) => {
  if (!imageName) return ''
  return `${supabaseUrl}/storage/v1/object/public/banner-images/${imageName}`
}