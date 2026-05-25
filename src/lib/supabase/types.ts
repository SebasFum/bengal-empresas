export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = "empresa" | "hogar" | "eventos" | "cocina" | "admin" | "company_admin" | "employee";
export type Segment = "empresa" | "hogar" | "eventos";
export type OrderStatus = "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string; name: string; contact_email: string | null;
          contact_phone: string | null; address: string | null;
          budget_per_person: number | null; delivery_time: string;
          active: boolean; created_at: string;
        };
        Insert: {
          id?: string; name: string; contact_email?: string | null;
          contact_phone?: string | null; address?: string | null;
          budget_per_person?: number | null; delivery_time?: string;
          active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; name?: string; contact_email?: string | null;
          contact_phone?: string | null; address?: string | null;
          budget_per_person?: number | null; delivery_time?: string;
          active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string; company_id: string | null; full_name: string | null;
          role: UserRole; dietary_restrictions: string[];
          phone: string | null; created_at: string;
        };
        Insert: {
          id: string; company_id?: string | null; full_name?: string | null;
          role?: UserRole; dietary_restrictions?: string[];
          phone?: string | null; created_at?: string;
        };
        Update: {
          id?: string; company_id?: string | null; full_name?: string | null;
          role?: UserRole; dietary_restrictions?: string[];
          phone?: string | null; created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "profiles_company_id_fkey"; columns: ["company_id"]; isOneToOne: false; referencedRelation: "companies"; referencedColumns: ["id"] }
        ];
      };
      menus: {
        Row: {
          id: string; name: string; description: string | null; category: string;
          price: number; calories: number | null; tags: string[];
          image_url: string | null; active: boolean; created_at: string;
        };
        Insert: {
          id?: string; name: string; description?: string | null; category: string;
          price: number; calories?: number | null; tags?: string[];
          image_url?: string | null; active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; name?: string; description?: string | null; category?: string;
          price?: number; calories?: number | null; tags?: string[];
          image_url?: string | null; active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      daily_menus: {
        Row: { id: string; menu_id: string; date: string; stock: number; orders_count: number; created_at: string };
        Insert: { id?: string; menu_id: string; date: string; stock?: number; orders_count?: number; created_at?: string };
        Update: { id?: string; menu_id?: string; date?: string; stock?: number; orders_count?: number; created_at?: string };
        Relationships: [
          { foreignKeyName: "daily_menus_menu_id_fkey"; columns: ["menu_id"]; isOneToOne: false; referencedRelation: "menus"; referencedColumns: ["id"] }
        ];
      };
      orders: {
        Row: {
          id: string; user_id: string; company_id: string | null; menu_id: string;
          daily_menu_id: string | null; date: string; status: OrderStatus;
          extras: string[]; notes: string | null; total: number;
          segment: Segment | null; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; company_id?: string | null; menu_id: string;
          daily_menu_id?: string | null; date: string; status?: OrderStatus;
          extras?: string[]; notes?: string | null; total: number;
          segment?: Segment | null; created_at?: string;
        };
        Update: {
          id?: string; user_id?: string; company_id?: string | null; menu_id?: string;
          daily_menu_id?: string | null; date?: string; status?: OrderStatus;
          extras?: string[]; notes?: string | null; total?: number;
          segment?: Segment | null; created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "orders_menu_id_fkey"; columns: ["menu_id"]; isOneToOne: false; referencedRelation: "menus"; referencedColumns: ["id"] }
        ];
      };
      menu_segment_prices: {
        Row: { id: string; menu_id: string; segment: Segment; price: number; active: boolean };
        Insert: { id?: string; menu_id: string; segment: Segment; price: number; active?: boolean };
        Update: { id?: string; menu_id?: string; segment?: Segment; price?: number; active?: boolean };
        Relationships: [
          { foreignKeyName: "menu_segment_prices_menu_id_fkey"; columns: ["menu_id"]; isOneToOne: false; referencedRelation: "menus"; referencedColumns: ["id"] }
        ];
      };
      ingredients: {
        Row: {
          id: string; name: string; unit: string; cost_per_unit: number;
          current_stock: number; min_stock_alert: number; supplier: string | null; created_at: string;
        };
        Insert: {
          id?: string; name: string; unit?: string; cost_per_unit?: number;
          current_stock?: number; min_stock_alert?: number; supplier?: string | null; created_at?: string;
        };
        Update: {
          id?: string; name?: string; unit?: string; cost_per_unit?: number;
          current_stock?: number; min_stock_alert?: number; supplier?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      menu_ingredients: {
        Row: { id: string; menu_id: string; ingredient_id: string; quantity: number };
        Insert: { id?: string; menu_id: string; ingredient_id: string; quantity: number };
        Update: { id?: string; menu_id?: string; ingredient_id?: string; quantity?: number };
        Relationships: [
          { foreignKeyName: "menu_ingredients_menu_id_fkey"; columns: ["menu_id"]; isOneToOne: false; referencedRelation: "menus"; referencedColumns: ["id"] },
          { foreignKeyName: "menu_ingredients_ingredient_id_fkey"; columns: ["ingredient_id"]; isOneToOne: false; referencedRelation: "ingredients"; referencedColumns: ["id"] }
        ];
      };
      promotions: {
        Row: {
          id: string; name: string; description: string | null; code: string | null;
          discount_type: "percentage" | "fixed"; discount_value: number;
          applies_to: "all" | Segment; min_order_total: number | null;
          valid_from: string; valid_until: string; active: boolean; created_at: string;
        };
        Insert: {
          id?: string; name: string; description?: string | null; code?: string | null;
          discount_type: "percentage" | "fixed"; discount_value: number;
          applies_to?: "all" | Segment; min_order_total?: number | null;
          valid_from: string; valid_until: string; active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; name?: string; description?: string | null; code?: string | null;
          discount_type?: "percentage" | "fixed"; discount_value?: number;
          applies_to?: "all" | Segment; min_order_total?: number | null;
          valid_from?: string; valid_until?: string; active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      client_discounts: {
        Row: {
          id: string; user_id: string | null; company_id: string | null;
          discount_type: "percentage" | "fixed"; discount_value: number;
          valid_until: string | null; note: string | null; active: boolean; created_at: string;
        };
        Insert: {
          id?: string; user_id?: string | null; company_id?: string | null;
          discount_type: "percentage" | "fixed"; discount_value: number;
          valid_until?: string | null; note?: string | null; active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; user_id?: string | null; company_id?: string | null;
          discount_type?: "percentage" | "fixed"; discount_value?: number;
          valid_until?: string | null; note?: string | null; active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      social_posts: {
        Row: {
          id: string; menu_date: string; caption: string | null;
          image_url: string | null; platform: string; published: boolean; created_at: string;
        };
        Insert: {
          id?: string; menu_date: string; caption?: string | null;
          image_url?: string | null; platform?: string; published?: boolean; created_at?: string;
        };
        Update: {
          id?: string; menu_date?: string; caption?: string | null;
          image_url?: string | null; platform?: string; published?: boolean; created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_orders_count: { Args: { p_daily_menu_id: string }; Returns: undefined };
      deduct_ingredients_for_order: { Args: { p_menu_id: string; p_quantity?: number }; Returns: undefined };
      current_user_role: { Args: Record<string, never>; Returns: string };
      current_user_company_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenient aliases
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Menu = Database["public"]["Tables"]["menus"]["Row"];
export type DailyMenu = Database["public"]["Tables"]["daily_menus"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];
export type MenuIngredient = Database["public"]["Tables"]["menu_ingredients"]["Row"];
export type MenuSegmentPrice = Database["public"]["Tables"]["menu_segment_prices"]["Row"];
export type Promotion = Database["public"]["Tables"]["promotions"]["Row"];
export type ClientDiscount = Database["public"]["Tables"]["client_discounts"]["Row"];
export type SocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
