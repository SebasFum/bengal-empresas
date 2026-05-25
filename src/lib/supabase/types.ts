export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          budget_per_person: number | null;
          delivery_time: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          budget_per_person?: number | null;
          delivery_time?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          budget_per_person?: number | null;
          delivery_time?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          full_name: string | null;
          role: "employee" | "company_admin" | "admin";
          dietary_restrictions: string[];
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          full_name?: string | null;
          role?: "employee" | "company_admin" | "admin";
          dietary_restrictions?: string[];
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          full_name?: string | null;
          role?: "employee" | "company_admin" | "admin";
          dietary_restrictions?: string[];
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      menus: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          calories: number | null;
          tags: string[];
          image_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          price: number;
          calories?: number | null;
          tags?: string[];
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          price?: number;
          calories?: number | null;
          tags?: string[];
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_menus: {
        Row: {
          id: string;
          menu_id: string;
          date: string;
          stock: number;
          orders_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          date: string;
          stock?: number;
          orders_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          date?: string;
          stock?: number;
          orders_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_menus_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          menu_id: string;
          daily_menu_id: string | null;
          date: string;
          status: "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";
          extras: string[];
          notes: string | null;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          menu_id: string;
          daily_menu_id?: string | null;
          date: string;
          status?: "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";
          extras?: string[];
          notes?: string | null;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          menu_id?: string;
          daily_menu_id?: string | null;
          date?: string;
          status?: "pendiente" | "en_produccion" | "en_camino" | "entregado" | "cancelado";
          extras?: string[];
          notes?: string | null;
          total?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_orders_count: {
        Args: { p_daily_menu_id: string };
        Returns: undefined;
      };
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
export type OrderStatus = Order["status"];
