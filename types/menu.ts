export interface Category {
  id: string
  name_he: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name_he: string
  description: string | null
  base_price: number
  image_url: string | null
  available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface ModifierGroup {
  id: string
  name_he: string
  selection_type: 'single' | 'multi'
  required: boolean
  created_at: string
}

export interface ModifierOption {
  id: string
  group_id: string
  name_he: string
  price_delta: number
  sort_order: number
}
