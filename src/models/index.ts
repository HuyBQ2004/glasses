// TypeScript Interfaces for Supabase PostgreSQL Tables (Eyewear Store)

export interface IRole {
  id: string;
  role_key: string;
  role_name: string;
  description?: string;
  created_at?: string;
}

export interface IAccount {
  id: string;
  username: string;
  password?: string;
  role: string;
  active: boolean;
  fullname?: string;
  phone?: string;
  email?: string;
  address?: string;
  token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IStore {
  id: string;
  store_name: string;
  owner_id: string;
  shipper_id?: string;
  warehouse_manager_id?: string;
  active: boolean;
  created_at?: string;
}

export interface ICategory {
  id: string;
  cname: string;
  store_id?: string;
  manufacturer?: string;
  created_at?: string;
}

export interface IProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  title?: string;
  description?: string;
  cate_id?: string;
  quantity: number;
  sell_id?: string;
  store_id?: string;
  manufacturer?: string; // Brand (Ray-Ban, Gentle Monster, Oakley, Gucci, Tom Ford)
  frame_shape?: string; // Frame Shape (Aviator, Square, Round, Cat-Eye, Rectangle)
  created_at?: string;
  updated_at?: string;
}

export interface ICartItem {
  id: string;
  account_id: string;
  product_id: string;
  amount: number;
  reserved_at?: string;
  expires_at?: string;
  created_at?: string;
  product?: IProduct;
}

export interface IShipping {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: string; // 'Pending' | 'Shipping' | 'Delivered' | 'Cancelled'
  shipper_id?: string;
  store_id?: string;
  shipped_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IStockImport {
  id: string;
  product_id: string;
  store_id: string;
  import_quantity: number;
  note?: string;
  created_by?: string;
  created_at?: string;
}

export interface IOrder {
  id: string;
  account_id: string;
  total_price: number;
  note?: string;
  create_date?: string;
  shipping_id?: string;
  store_id?: string;
  vat_percent: number;
  payment_method?: string; // 'COD' | 'PayOS'
  payment_status?: string; // 'Pending' | 'Paid' | 'Failed'
  created_at?: string;
  updated_at?: string;
  account?: IAccount;
  shipping?: IShipping;
  store?: IStore;
  items?: IOrderDetail[];
}

export interface IOrderDetail {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
  created_at?: string;
}

export interface IVoucher {
  id: string;
  code: string;
  discount_percent: number;
  max_discount?: number;
  min_order_value?: number;
  expiry_date: string;
  start_date?: string;
  store_id?: string;
  created_at?: string;
}

export interface IFeedback {
  id: string;
  account_id: string;
  product_id: string;
  store_id?: string;
  rating: number;
  content?: string;
  create_date?: string;
  is_edited: boolean;
  is_hidden: boolean;
  created_at?: string;
  account?: IAccount;
}

export interface ISlider {
  id: string;
  title?: string;
  image_url: string;
  back_link?: string;
  status: boolean;
  description?: string;
  created_at?: string;
}

export interface IHomeSetting {
  id: string;
  hero_badge: string;
  hero_title: string;
  hero_highlight?: string;
  hero_description: string;
  primary_button_text: string;
  secondary_button_text?: string;
  featured_title: string;
  show_stats: boolean;
  show_filter_sidebar: boolean;
  show_featured_section: boolean;
  featured_mode: string;
  featured_product_id?: string;
  created_at?: string;
}
