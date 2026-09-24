// Track Type - faixas de áudio
export interface Track {
  id: number
  name: string
  position: string
  duration?: string
  duration_seconds?: number
  audio_url?: string
  audio_source?: 'local' | 'youtube'
  has_audio?: boolean
}

// Vinyl Types - campos que vêm da API (VinylApiFormatter)
export interface Vinyl {
  id: number
  title: string
  artist: string
  slug?: string
  cover_image?: string
  image_url?: string
  price?: number
  formatted_price?: string
  original_price?: number
  formatted_original_price?: string
  is_new?: boolean
  is_promotional?: boolean
  is_preorder?: boolean
  in_stock?: boolean
  can_buy?: boolean
  show_wishlist?: boolean
  show_wantlist?: boolean
  stock?: number
  availability?: string
  condition?: string
  format?: string
  record_label?: string
  release_year?: number
  release_date?: string
  formatted_release_date?: string
  store_section?: string
  genres?: string[]
  styles?: string[]
  tracks?: Track[]
  tracks_count?: number
  has_playable_tracks?: boolean
  product_type?: {
    id: number
    name: string
    slug: string
  }
  [key: string]: any
}

// Vinyl Stock Types - estrutura completa do backend
export interface VinylStock extends Vinyl {
  vinyl_master?: {
    id: number
    title: string
    slug: string
    artist_names: string
    cover_url: string | null
    record_label?: {
      name: string
    }
  }
  sell_price?: number
  promotional_price?: number | null
  availability?: string
  visibility?: string
  current_price?: number
}

export interface VinylListResponse {
  data: VinylStock[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  is_dj: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

// Cart Types
export interface CartItem {
  id: number
  vinyl_stock_id: number
  quantity: number
  unit_price: number
  vinyl_stock: VinylStock
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  subtotal: number
  total: number
}

// Order Types
export interface OrderItem {
  id: number
  vinyl_stock_id: number
  quantity: number
  unit_price: number
  total_price: number
  vinyl_stock: {
    vinyl_master: {
      title: string
      artist_names: string
    }
  }
}

export interface Order {
  id: number
  order_number: string
  status: string
  status_label: string
  subtotal: number
  shipping_cost: number
  total: number
  formatted_total: string
  items: OrderItem[]
  created_at: string
}
