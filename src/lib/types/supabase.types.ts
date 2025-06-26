export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_user: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          c_bpartner_id: number | null
          created_at: string
          email: string | null
          first_name: string | null
          id: number
          is_active: boolean
          is_admin: boolean
          last_name: string | null
          phone: string | null
          role: string
          supervisor_id: number | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          c_bpartner_id?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: number
          is_active?: boolean
          is_admin?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          supervisor_id?: number | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          c_bpartner_id?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: number
          is_active?: boolean
          is_admin?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          supervisor_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_user_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_supervisor_id_fkey"
            columns: ["supervisor_id"]
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          },
        ]
      }
      asset: {
        Row: {
          created_at: string
          id: number
          mimeType: string | null
          name: string
          source: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          mimeType?: string | null
          name: string
          source: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          mimeType?: string | null
          name?: string
          source?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      c_bpartner: {
        Row: {
          ad_language: string | null
          bpartner_parent_id: number | null
          created_at: string
          display_name: string
          duns: string | null
          id: number
          is_active: boolean
          iscustomer: boolean
          isemployee: boolean
          issalesrep: boolean
          isvendor: boolean
          m_pricelist_id: number | null
          po_pricelist_id: number | null
          taxid: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          ad_language?: string | null
          bpartner_parent_id?: number | null
          created_at?: string
          display_name: string
          duns?: string | null
          id?: number
          is_active?: boolean
          iscustomer?: boolean
          isemployee?: boolean
          issalesrep?: boolean
          isvendor?: boolean
          m_pricelist_id?: number | null
          po_pricelist_id?: number | null
          taxid?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          ad_language?: string | null
          bpartner_parent_id?: number | null
          created_at?: string
          display_name?: string
          duns?: string | null
          id?: number
          is_active?: boolean
          iscustomer?: boolean
          isemployee?: boolean
          issalesrep?: boolean
          isvendor?: boolean
          m_pricelist_id?: number | null
          po_pricelist_id?: number | null
          taxid?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "c_bpartner_bpartner_parent_id_fkey"
            columns: ["bpartner_parent_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_po_pricelist_id_fkey"
            columns: ["po_pricelist_id"]
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
        ]
      }
      c_bpartner_location: {
        Row: {
          c_bpartner_id: number
          created_at: string
          id: number
          is_active: boolean
          isbillto: boolean
          isshipto: boolean
          name: string
          phone: string | null
          phone2: string | null
          updated_at: string
        }
        Insert: {
          c_bpartner_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          isbillto?: boolean
          isshipto?: boolean
          name?: string
          phone?: string | null
          phone2?: string | null
          updated_at?: string
        }
        Update: {
          c_bpartner_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          isbillto?: boolean
          isshipto?: boolean
          name?: string
          phone?: string | null
          phone2?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_bpartner_location_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
        ]
      }
      c_channel: {
        Row: {
          c_channel_uu: string | null
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          c_channel_uu?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          c_channel_uu?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      c_channel_map: {
        Row: {
          c_channel_id: number
          c_taxcategory_id: number | null
          c_uom_id: number | null
          channel_code: string
          created_at: string
          entity_type: Database["public"]["Enums"]["Entity"]
          id: number
          is_active: boolean
          m_product_category_id: number | null
          m_warehouse_id: number | null
          reference_id: number
          updated_at: string
        }
        Insert: {
          c_channel_id: number
          c_taxcategory_id?: number | null
          c_uom_id?: number | null
          channel_code: string
          created_at?: string
          entity_type?: Database["public"]["Enums"]["Entity"]
          id?: number
          is_active?: boolean
          m_product_category_id?: number | null
          m_warehouse_id?: number | null
          reference_id: number
          updated_at?: string
        }
        Update: {
          c_channel_id?: number
          c_taxcategory_id?: number | null
          c_uom_id?: number | null
          channel_code?: string
          created_at?: string
          entity_type?: Database["public"]["Enums"]["Entity"]
          id?: number
          is_active?: boolean
          m_product_category_id?: number | null
          m_warehouse_id?: number | null
          reference_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_c_uom_id_fkey"
            columns: ["c_uom_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      c_channel_map_bpartner: {
        Row: {
          c_bpartner_id: number
          c_channel_id: number
          created_at: string
          id: number
          is_active: boolean
          resource_id: string
          updated_at: string
        }
        Insert: {
          c_bpartner_id: number
          c_channel_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          resource_id: string
          updated_at?: string
        }
        Update: {
          c_bpartner_id?: number
          c_channel_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          resource_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_bpartner_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_bpartner_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
        ]
      }
      c_channel_map_category: {
        Row: {
          c_channel_id: number
          created_at: string
          id: number
          is_active: boolean
          m_product_category_id: number | null
          resource_id: string
          resource_name: string
          updated_at: string
        }
        Insert: {
          c_channel_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          m_product_category_id?: number | null
          resource_id: string
          resource_name: string
          updated_at?: string
        }
        Update: {
          c_channel_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          m_product_category_id?: number | null
          resource_id?: string
          resource_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_category_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_category_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      c_channel_map_warehouse: {
        Row: {
          c_channel_id: number
          created_at: string
          id: number
          is_active: boolean
          m_warehouse_id: number
          resource_id: string
          updated_at: string
        }
        Insert: {
          c_channel_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          m_warehouse_id: number
          resource_id: string
          updated_at?: string
        }
        Update: {
          c_channel_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          m_warehouse_id?: number
          resource_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_warehouse_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_warehouse_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      c_country: {
        Row: {
          alpha_2: string
          c_currency_id: number | null
          created_at: string
          full_name: string | null
          id: number
          is_active: boolean
          short_name: string
          updated_at: string
        }
        Insert: {
          alpha_2: string
          c_currency_id?: number | null
          created_at?: string
          full_name?: string | null
          id?: number
          is_active?: boolean
          short_name: string
          updated_at?: string
        }
        Update: {
          alpha_2?: string
          c_currency_id?: number | null
          created_at?: string
          full_name?: string | null
          id?: number
          is_active?: boolean
          short_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_country_c_currency_id_fkey"
            columns: ["c_currency_id"]
            referencedRelation: "c_currency"
            referencedColumns: ["id"]
          },
        ]
      }
      c_currency: {
        Row: {
          alphabetic_code: string
          created_at: string
          cursymbol: string | null
          id: number
          is_enabled: boolean
          minor_unit: number
          name: string
          numeric_code: string
          updated_at: string
        }
        Insert: {
          alphabetic_code: string
          created_at?: string
          cursymbol?: string | null
          id?: number
          is_enabled?: boolean
          minor_unit?: number
          name: string
          numeric_code: string
          updated_at?: string
        }
        Update: {
          alphabetic_code?: string
          created_at?: string
          cursymbol?: string | null
          id?: number
          is_enabled?: boolean
          minor_unit?: number
          name?: string
          numeric_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      c_postal_code: {
        Row: {
          c_country_id: number
          code: string
          created_at: string
          id: number
          is_active: boolean
          updated_at: string
        }
        Insert: {
          c_country_id: number
          code: string
          created_at?: string
          id?: number
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          c_country_id?: number
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_postal_code_c_country_id_fkey"
            columns: ["c_country_id"]
            referencedRelation: "c_country"
            referencedColumns: ["id"]
          },
        ]
      }
      c_tax: {
        Row: {
          c_taxcategory_id: number
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          isdefault: boolean
          name: string
          rate: number
          updated_at: string
        }
        Insert: {
          c_taxcategory_id: number
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          isdefault?: boolean
          name: string
          rate: number
          updated_at?: string
        }
        Update: {
          c_taxcategory_id?: number
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          isdefault?: boolean
          name?: string
          rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_tax_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          },
        ]
      }
      c_taxcategory: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      c_uom: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          is_default: boolean
          name: string
          stdprecision: number
          uomsymbol: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_default?: boolean
          name: string
          stdprecision: number
          uomsymbol?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_default?: boolean
          name?: string
          stdprecision?: number
          uomsymbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      c_uom_conversion: {
        Row: {
          c_uom_id: number | null
          c_uom_to_id: number | null
          created_at: string
          dividerate: number | null
          id: number
          is_active: boolean | null
          m_product_id: number | null
          multiplyrate: number | null
          updated_at: string | null
        }
        Insert: {
          c_uom_id?: number | null
          c_uom_to_id?: number | null
          created_at?: string
          dividerate?: number | null
          id?: number
          is_active?: boolean | null
          m_product_id?: number | null
          multiplyrate?: number | null
          updated_at?: string | null
        }
        Update: {
          c_uom_id?: number | null
          c_uom_to_id?: number | null
          created_at?: string
          dividerate?: number | null
          id?: number
          is_active?: boolean | null
          m_product_id?: number | null
          multiplyrate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "c_uom_conversion_c_uom_id_fkey"
            columns: ["c_uom_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_c_uom_to_id_fkey"
            columns: ["c_uom_to_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_types: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          auth_user_id: string | null
          contact_types_id: number
          created_at: string
          created_by: string | null
          display_name: string | null
          id: number
          identification_number: string | null
          identification_type: string | null
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
          vat_number: string | null
        }
        Insert: {
          auth_user_id?: string | null
          contact_types_id?: number
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: number
          identification_number?: string | null
          identification_type?: string | null
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
        }
        Update: {
          auth_user_id?: string | null
          contact_types_id?: number
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: number
          identification_number?: string | null
          identification_type?: string | null
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          continent: Database["public"]["Enums"]["continents"] | null
          id: number
          iso2: string
          iso3: string | null
          local_name: string | null
          name: string | null
        }
        Insert: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Update: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2?: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      m_attribute: {
        Row: {
          attribute_group_id: number
          attribute_type: Database["public"]["Enums"]["attribute_type"]
          code: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          attribute_group_id?: number
          attribute_type: Database["public"]["Enums"]["attribute_type"]
          code: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          attribute_group_id?: number
          attribute_type?: Database["public"]["Enums"]["attribute_type"]
          code?: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attribute_attribute_group_id_fkey"
            columns: ["attribute_group_id"]
            referencedRelation: "m_attribute_group"
            referencedColumns: ["id"]
          },
        ]
      }
      m_attribute_group: {
        Row: {
          code: string
          created_at: string
          id: number
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      m_attribute_option: {
        Row: {
          attribute_id: number
          code: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          attribute_id: number
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          attribute_id?: number
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_attribute_option_attribute_id_fkey"
            columns: ["attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
        ]
      }
      m_attributeset: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      m_attributeset_attribute: {
        Row: {
          attribute_id: number
          attributeset_id: number
          created_at: string
          id: number
          is_active: boolean
          is_required: boolean
          sequence: number | null
          updated_at: string
        }
        Insert: {
          attribute_id: number
          attributeset_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          is_required?: boolean
          sequence?: number | null
          updated_at?: string
        }
        Update: {
          attribute_id?: number
          attributeset_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          is_required?: boolean
          sequence?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeset_attribute_attribute_id_fkey"
            columns: ["attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeset_attribute_attributeset_id_fkey"
            columns: ["attributeset_id"]
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          },
        ]
      }
      m_discountschema: {
        Row: {
          created_at: string
          flatdiscount: number | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
          validfrom: string | null
        }
        Insert: {
          created_at?: string
          flatdiscount?: number | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
          validfrom?: string | null
        }
        Update: {
          created_at?: string
          flatdiscount?: number | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
          validfrom?: string | null
        }
        Relationships: []
      }
      m_locator: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          is_default: boolean
          m_warehouse_id: number
          updated_at: string
          value: string
          x: string | null
          y: string | null
          z: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          is_default?: boolean
          m_warehouse_id: number
          updated_at?: string
          value: string
          x?: string | null
          y?: string | null
          z?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          is_default?: boolean
          m_warehouse_id?: number
          updated_at?: string
          value?: string
          x?: string | null
          y?: string | null
          z?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_locator_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      m_pricelist: {
        Row: {
          basepricelist_id: number | null
          c_currency_id: number
          created_at: string
          description: string | null
          enforcepricelimit: boolean
          id: number
          is_active: boolean
          is_default: boolean
          is_taxincluded: boolean | null
          issopricelist: boolean
          name: string
          priceprecision: number
          updated_at: string
        }
        Insert: {
          basepricelist_id?: number | null
          c_currency_id: number
          created_at?: string
          description?: string | null
          enforcepricelimit?: boolean
          id?: number
          is_active?: boolean
          is_default?: boolean
          is_taxincluded?: boolean | null
          issopricelist?: boolean
          name: string
          priceprecision?: number
          updated_at?: string
        }
        Update: {
          basepricelist_id?: number | null
          c_currency_id?: number
          created_at?: string
          description?: string | null
          enforcepricelimit?: boolean
          id?: number
          is_active?: boolean
          is_default?: boolean
          is_taxincluded?: boolean | null
          issopricelist?: boolean
          name?: string
          priceprecision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_pricelist_basepricelist_id_fkey"
            columns: ["basepricelist_id"]
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_c_currency_id_fkey"
            columns: ["c_currency_id"]
            referencedRelation: "c_currency"
            referencedColumns: ["id"]
          },
        ]
      }
      m_pricelist_version: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          m_discountschema_id: number
          m_pricelist_id: number
          m_pricelist_version_base_id: number | null
          name: string
          updated_at: string
          validfrom: string
          validto: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          m_discountschema_id: number
          m_pricelist_id: number
          m_pricelist_version_base_id?: number | null
          name: string
          updated_at?: string
          validfrom: string
          validto?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          m_discountschema_id?: number
          m_pricelist_id?: number
          m_pricelist_version_base_id?: number | null
          name?: string
          updated_at?: string
          validfrom?: string
          validto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_pricelist_version_m_discountschema_id_fkey"
            columns: ["m_discountschema_id"]
            referencedRelation: "m_discountschema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_m_pricelist_version_base_id_fkey"
            columns: ["m_pricelist_version_base_id"]
            referencedRelation: "m_pricelist_version"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product: {
        Row: {
          attributeset_id: number | null
          c_taxcategory_id: number
          c_uom_id: number
          condition: string | null
          created_at: string
          description: string | null
          descriptionurl: string | null
          discontinued: boolean
          featuredAssetId: number | null
          id: number
          imageurl: string | null
          is_active: boolean
          is_self_service: boolean
          m_product_brand_id: number | null
          m_product_category_id: number | null
          m_product_uu: string | null
          mpn: string | null
          name: string
          net_qty_uom_id: number | null
          net_quantity: number
          producttype: string
          shelf_life: number
          sku: string | null
          unitsperpack: number
          updated_at: string
        }
        Insert: {
          attributeset_id?: number | null
          c_taxcategory_id?: number
          c_uom_id?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          descriptionurl?: string | null
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          is_active?: boolean
          is_self_service?: boolean
          m_product_brand_id?: number | null
          m_product_category_id?: number | null
          m_product_uu?: string | null
          mpn?: string | null
          name: string
          net_qty_uom_id?: number | null
          net_quantity?: number
          producttype?: string
          shelf_life?: number
          sku?: string | null
          unitsperpack?: number
          updated_at?: string
        }
        Update: {
          attributeset_id?: number | null
          c_taxcategory_id?: number
          c_uom_id?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          descriptionurl?: string | null
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          is_active?: boolean
          is_self_service?: boolean
          m_product_brand_id?: number | null
          m_product_category_id?: number | null
          m_product_uu?: string | null
          mpn?: string | null
          name?: string
          net_qty_uom_id?: number | null
          net_quantity?: number
          producttype?: string
          shelf_life?: number
          sku?: string | null
          unitsperpack?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_attributeset_id_fkey"
            columns: ["attributeset_id"]
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_c_uom_id_fkey"
            columns: ["c_uom_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_featuredAssetId_fkey"
            columns: ["featuredAssetId"]
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_m_attributeset_id_fkey"
            columns: ["attributeset_id"]
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_m_product_brand_id_fkey"
            columns: ["m_product_brand_id"]
            referencedRelation: "m_product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_net_qty_uom_id_fkey"
            columns: ["net_qty_uom_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product_attribute_option: {
        Row: {
          attribute_id: number
          created_at: string | null
          id: number
          is_active: boolean | null
          option_id: number
          product_id: number
          updated_at: string | null
        }
        Insert: {
          attribute_id: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          option_id: number
          product_id: number
          updated_at?: string | null
        }
        Update: {
          attribute_id?: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          option_id?: number
          product_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_product_attribute_option_attribute_id_fkey"
            columns: ["attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_attribute_option_option_id_fkey"
            columns: ["option_id"]
            referencedRelation: "m_attribute_option"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_attribute_option_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product_attribute_value: {
        Row: {
          attribute_id: number
          boolean_value: boolean | null
          created_at: string | null
          date_value: string | null
          id: number
          is_active: boolean | null
          number_value: number | null
          product_id: number
          text_value: string | null
          updated_at: string | null
        }
        Insert: {
          attribute_id: number
          boolean_value?: boolean | null
          created_at?: string | null
          date_value?: string | null
          id?: number
          is_active?: boolean | null
          number_value?: number | null
          product_id: number
          text_value?: string | null
          updated_at?: string | null
        }
        Update: {
          attribute_id?: number
          boolean_value?: boolean | null
          created_at?: string | null
          date_value?: string | null
          id?: number
          is_active?: boolean | null
          number_value?: number | null
          product_id?: number
          text_value?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_product_attribute_value_attribute_id_fkey"
            columns: ["attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_attribute_value_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product_brands: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      m_product_category: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          is_self_service: boolean
          name: string
          parent_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_self_service?: boolean
          name: string
          parent_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          is_self_service?: boolean
          name?: string
          parent_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_category_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product_packing: {
        Row: {
          created_at: string
          gtin: string | null
          id: number
          is_display: boolean
          m_product_id: number
          packing_type: Database["public"]["Enums"]["PackingType"]
          unitsperpack: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gtin?: string | null
          id?: number
          is_display?: boolean
          m_product_id: number
          packing_type?: Database["public"]["Enums"]["PackingType"]
          unitsperpack?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gtin?: string | null
          id?: number
          is_display?: boolean
          m_product_id?: number
          packing_type?: Database["public"]["Enums"]["PackingType"]
          unitsperpack?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_packing_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_product_po: {
        Row: {
          barcode: string | null
          c_bpartner_id: number
          c_currency_id: number | null
          c_uom_id: number | null
          created_at: string
          discontinued: boolean | null
          id: number
          is_active: boolean
          iscurrentvendor: boolean
          m_product_id: number
          manufacturer: string | null
          order_min: number
          pricelist: number
          updated_at: string
          url: string | null
          valid_from: string | null
          valid_to: string | null
          vendorcategory: string | null
          vendorproductno: string
        }
        Insert: {
          barcode?: string | null
          c_bpartner_id: number
          c_currency_id?: number | null
          c_uom_id?: number | null
          created_at?: string
          discontinued?: boolean | null
          id?: number
          is_active?: boolean
          iscurrentvendor?: boolean
          m_product_id: number
          manufacturer?: string | null
          order_min?: number
          pricelist?: number
          updated_at?: string
          url?: string | null
          valid_from?: string | null
          valid_to?: string | null
          vendorcategory?: string | null
          vendorproductno: string
        }
        Update: {
          barcode?: string | null
          c_bpartner_id?: number
          c_currency_id?: number | null
          c_uom_id?: number | null
          created_at?: string
          discontinued?: boolean | null
          id?: number
          is_active?: boolean
          iscurrentvendor?: boolean
          m_product_id?: number
          manufacturer?: string | null
          order_min?: number
          pricelist?: number
          updated_at?: string
          url?: string | null
          valid_from?: string | null
          valid_to?: string | null
          vendorcategory?: string | null
          vendorproductno?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_po_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_c_currency_id_fkey"
            columns: ["c_currency_id"]
            referencedRelation: "c_currency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_c_uom_id_fkey"
            columns: ["c_uom_id"]
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_productprice: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          m_pricelist_version_id: number
          m_product_id: number
          pricelimit: number | null
          pricelist: number | null
          pricestd: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          m_pricelist_version_id: number
          m_product_id: number
          pricelimit?: number | null
          pricelist?: number | null
          pricestd?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          m_pricelist_version_id?: number
          m_product_id?: number
          pricelimit?: number | null
          pricelist?: number | null
          pricestd?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_productprice_m_pricelist_version_id_fkey"
            columns: ["m_pricelist_version_id"]
            referencedRelation: "m_pricelist_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_productprice_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_replenish: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          level_max: number
          level_min: number
          m_locator_id: number | null
          m_product_id: number
          m_replenish_uu: string | null
          m_warehouse_id: number
          m_warehousesource_id: number | null
          qtybatchsize: number
          replenishtype: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          level_max?: number
          level_min?: number
          m_locator_id?: number | null
          m_product_id: number
          m_replenish_uu?: string | null
          m_warehouse_id: number
          m_warehousesource_id?: number | null
          qtybatchsize?: number
          replenishtype?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          level_max?: number
          level_min?: number
          m_locator_id?: number | null
          m_product_id?: number
          m_replenish_uu?: string | null
          m_warehouse_id?: number
          m_warehousesource_id?: number | null
          qtybatchsize?: number
          replenishtype?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_replenish_m_locator_id_fkey"
            columns: ["m_locator_id"]
            referencedRelation: "m_locator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_warehousesource_id_fkey"
            columns: ["m_warehousesource_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      m_storageonhand: {
        Row: {
          created_at: string
          id: number
          is_active: boolean | null
          m_locator_id: number | null
          m_product_id: number
          qtyonhand: number
          updated_at: string
          warehouse_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean | null
          m_locator_id?: number | null
          m_product_id: number
          qtyonhand: number
          updated_at?: string
          warehouse_id: number
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean | null
          m_locator_id?: number | null
          m_product_id?: number
          qtyonhand?: number
          updated_at?: string
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "m_storageonhand_m_locator_id_fkey"
            columns: ["m_locator_id"]
            referencedRelation: "m_locator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      m_substitute: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          m_product_id: number
          name: string | null
          substitute_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          m_product_id: number
          name?: string | null
          substitute_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          m_product_id?: number
          name?: string | null
          substitute_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_substitute_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_substitute_substitute_id_fkey"
            columns: ["substitute_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
        ]
      }
      m_warehouse: {
        Row: {
          code: string
          created_at: string
          id: number
          is_active: boolean
          is_self_service: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          is_active?: boolean
          is_self_service?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          is_self_service?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_formulas: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          script: string | null
          updated_at: string
          variables: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          script?: string | null
          updated_at?: string
          variables?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          script?: string | null
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
      price_rule_attribute_options: {
        Row: {
          created_at: string
          m_attribute_option_id: number
          price_rule_id: number
        }
        Insert: {
          created_at?: string
          m_attribute_option_id: number
          price_rule_id: number
        }
        Update: {
          created_at?: string
          m_attribute_option_id?: number
          price_rule_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_rule_attribute_options_m_attribute_option_id_fkey"
            columns: ["m_attribute_option_id"]
            referencedRelation: "m_attribute_option"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_rule_attribute_options_price_rule_id_fkey"
            columns: ["price_rule_id"]
            referencedRelation: "price_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      price_rules: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          m_attribute_id: number | null
          m_product_category_id: number | null
          m_product_id: number | null
          name: string | null
          price_formula_id: number
          priority: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          m_attribute_id?: number | null
          m_product_category_id?: number | null
          m_product_id?: number | null
          name?: string | null
          price_formula_id: number
          priority?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          m_attribute_id?: number | null
          m_product_category_id?: number | null
          m_product_id?: number | null
          name?: string | null
          price_formula_id?: number
          priority?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_rules_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_rules_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_rules_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_rules_price_formula_id_fkey"
            columns: ["price_formula_id"]
            referencedRelation: "price_formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          conditions: Json
          created_at: string | null
          ends_at: string | null
          formula: Json
          id: number
          is_active: boolean
          name: string
          priority: number
          starts_at: string | null
          target_group: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json
          created_at?: string | null
          ends_at?: string | null
          formula: Json
          id?: never
          is_active?: boolean
          name: string
          priority?: number
          starts_at?: string | null
          target_group?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          ends_at?: string | null
          formula?: Json
          id?: never
          is_active?: boolean
          name?: string
          priority?: number
          starts_at?: string | null
          target_group?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      w_basket: {
        Row: {
          ad_user_id: number
          c_bpartner_id: number | null
          created_at: string
          id: number
          is_active: boolean
          m_pricelist_id: number | null
          session_id: string | null
          updated_at: string
          w_basket_uu: string
        }
        Insert: {
          ad_user_id: number
          c_bpartner_id?: number | null
          created_at?: string
          id?: number
          is_active?: boolean
          m_pricelist_id?: number | null
          session_id?: string | null
          updated_at?: string
          w_basket_uu?: string
        }
        Update: {
          ad_user_id?: number
          c_bpartner_id?: number | null
          created_at?: string
          id?: number
          is_active?: boolean
          m_pricelist_id?: number | null
          session_id?: string | null
          updated_at?: string
          w_basket_uu?: string
        }
        Relationships: [
          {
            foreignKeyName: "w_basket_ad_user_id_fkey"
            columns: ["ad_user_id"]
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
        ]
      }
      w_basketline: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          m_product_id: number | null
          price: number
          product: string | null
          qty: number
          updated_at: string
          w_basket_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          m_product_id?: number | null
          price?: number
          product?: string | null
          qty?: number
          updated_at?: string
          w_basket_id: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          m_product_id?: number | null
          price?: number
          product?: string | null
          qty?: number
          updated_at?: string
          w_basket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "w_basketline_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basketline_w_basket_id_fkey"
            columns: ["w_basket_id"]
            referencedRelation: "w_basket"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_update_product_po: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      bulk_update_productprice: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      bulk_update_products: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      bulk_update_storageonhand: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      check_attributes_match: {
        Args: {
          p_rule_attributes: Json
          p_product_attributes: Json
        }
        Returns: boolean
      }
      delete_avatar: {
        Args: {
          avatar_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      find_applicable_pricing_rules: {
        Args: {
          p_product_id: number
          p_partner_id?: number
          p_quantity?: number
          p_order_value?: number
          p_target_group?: string
        }
        Returns: {
          id: number
          name: string
          conditions: Json
          formula: Json
          priority: number
          target_group: string
        }[]
      }
      get_price_formula_variables: {
        Args: {
          p_m_product_id: number
        }
        Returns: Json
      }
      get_product_attributes: {
        Args: {
          p_product_id: number
        }
        Returns: Json
      }
      is_valid_gtin: {
        Args: {
          barcode: string
        }
        Returns: boolean
      }
      search_products: {
        Args: {
          search_term: string
        }
        Returns: {
          id: number
          name: string
          mpn: string
          sku: string
          m_product_category_id: number
          is_active: boolean
        }[]
      }
    }
    Enums: {
      attribute_type:
        | "single_select"
        | "multi_select"
        | "text"
        | "number"
        | "boolean"
        | "date"
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
      Entity: "Category" | "Warehouse" | "UoM" | "TaxCategory"
      PackingType: "Individual" | "Pack" | "Pallet"
      region_type: "city" | "district" | "autonomous province"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
