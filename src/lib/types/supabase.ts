export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
      _template: {
        Row: {
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "_template_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_client: {
        Row: {
          ad_language: string | null
          created: string
          createdby: string | null
          id: number
          isactive: boolean
          name: string
          updated: string
          updatedby: string | null
          value: string
        }
        Insert: {
          ad_language?: string | null
          created?: string
          createdby?: string | null
          id?: number
          isactive?: boolean
          name: string
          updated?: string
          updatedby?: string | null
          value: string
        }
        Update: {
          ad_language?: string | null
          created?: string
          createdby?: string | null
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
          updatedby?: string | null
          value?: string
        }
        Relationships: []
      }
      ad_org: {
        Row: {
          ad_client_id: number
          code: string | null
          created: string
          description: string | null
          id: number
          isactive: boolean
          name: string
          updated: string
          value: string
        }
        Insert: {
          ad_client_id?: number
          code?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name: string
          updated?: string
          value: string
        }
        Update: {
          ad_client_id?: number
          code?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_org_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_user: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          auth_user_id: string | null
          avatar_url: string | null
          c_bpartner_id: number | null
          created: string
          email: string | null
          full_name: string | null
          id: number
          isactive: boolean
          supervisor_id: number | null
          updated: string
          username: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          auth_user_id?: string | null
          avatar_url?: string | null
          c_bpartner_id?: number | null
          created?: string
          email?: string | null
          full_name?: string | null
          id?: number
          isactive?: boolean
          supervisor_id?: number | null
          updated?: string
          username?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          auth_user_id?: string | null
          avatar_url?: string | null
          c_bpartner_id?: number | null
          created?: string
          email?: string | null
          full_name?: string | null
          id?: number
          isactive?: boolean
          supervisor_id?: number | null
          updated?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_user_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_auth_user_id_fkey"
            columns: ["auth_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      asset: {
        Row: {
          created: string
          id: number
          mimeType: string | null
          name: string
          source: string
          type: string | null
          updated: string
        }
        Insert: {
          created?: string
          id?: number
          mimeType?: string | null
          name: string
          source: string
          type?: string | null
          updated?: string
        }
        Update: {
          created?: string
          id?: number
          mimeType?: string | null
          name?: string
          source?: string
          type?: string | null
          updated?: string
        }
        Relationships: []
      }
      c_bpartner: {
        Row: {
          ad_language: string | null
          bpartner_parent_id: number | null
          created: string
          duns: string | null
          id: number
          isactive: boolean
          iscustomer: boolean
          isemployee: boolean
          issalesrep: boolean
          isvendor: boolean
          m_pricelist_id: number | null
          name: string
          po_pricelist_id: number | null
          taxid: string | null
          updated: string
          value: string | null
        }
        Insert: {
          ad_language?: string | null
          bpartner_parent_id?: number | null
          created?: string
          duns?: string | null
          id?: number
          isactive?: boolean
          iscustomer?: boolean
          isemployee?: boolean
          issalesrep?: boolean
          isvendor?: boolean
          m_pricelist_id?: number | null
          name: string
          po_pricelist_id?: number | null
          taxid?: string | null
          updated?: string
          value?: string | null
        }
        Update: {
          ad_language?: string | null
          bpartner_parent_id?: number | null
          created?: string
          duns?: string | null
          id?: number
          isactive?: boolean
          iscustomer?: boolean
          isemployee?: boolean
          issalesrep?: boolean
          isvendor?: boolean
          m_pricelist_id?: number | null
          name?: string
          po_pricelist_id?: number | null
          taxid?: string | null
          updated?: string
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
          }
        ]
      }
      c_bpartner_location: {
        Row: {
          ad_org_id: number
          c_bpartner_id: number
          created: string
          id: number
          isactive: boolean
          isbillto: boolean
          isshipto: boolean
          name: string
          phone: string | null
          phone2: string | null
          updated: string
        }
        Insert: {
          ad_org_id?: number
          c_bpartner_id: number
          created?: string
          id?: number
          isactive?: boolean
          isbillto?: boolean
          isshipto?: boolean
          name?: string
          phone?: string | null
          phone2?: string | null
          updated?: string
        }
        Update: {
          ad_org_id?: number
          c_bpartner_id?: number
          created?: string
          id?: number
          isactive?: boolean
          isbillto?: boolean
          isshipto?: boolean
          name?: string
          phone?: string | null
          phone2?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_bpartner_location_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_location_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel: {
        Row: {
          ad_org_id: number
          c_channel_uu: string | null
          created: string
          description: string | null
          id: number
          isactive: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          c_channel_uu?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          c_channel_uu?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel_map: {
        Row: {
          ad_org_id: number
          c_channel_id: number
          channel_code: string
          created: string
          entity_type: Database["public"]["Enums"]["Entity"]
          id: number
          internal_code: string
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_org_id?: number
          c_channel_id: number
          channel_code: string
          created?: string
          entity_type?: Database["public"]["Enums"]["Entity"]
          id?: number
          internal_code: string
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_org_id?: number
          c_channel_id?: number
          channel_code?: string
          created?: string
          entity_type?: Database["public"]["Enums"]["Entity"]
          id?: number
          internal_code?: string
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel_map_bpartner: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_bpartner_id: number
          c_channel_id: number
          created: string
          id: number
          isactive: boolean
          resource_id: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_bpartner_id: number
          c_channel_id: number
          created?: string
          id?: number
          isactive?: boolean
          resource_id: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_bpartner_id?: number
          c_channel_id?: number
          created?: string
          id?: number
          isactive?: boolean
          resource_id?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_bpartner_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_bpartner_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      c_channel_map_category: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_channel_id: number
          created: string
          id: number
          isactive: boolean
          m_product_category_id: number | null
          resource_id: string
          resource_name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id: number
          created?: string
          id?: number
          isactive?: boolean
          m_product_category_id?: number | null
          resource_id: string
          resource_name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_product_category_id?: number | null
          resource_id?: string
          resource_name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_category_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_category_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      c_channel_map_tax: {
        Row: {
          ad_org_id: number
          c_channel_id: number
          c_taxcategory_id: number
          created: string
          id: number
          isactive: boolean
          resource_id: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          c_channel_id: number
          c_taxcategory_id: number
          created?: string
          id?: number
          isactive?: boolean
          resource_id: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          c_channel_id?: number
          c_taxcategory_id?: number
          created?: string
          id?: number
          isactive?: boolean
          resource_id?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_tax_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_tax_c_channel_id_fkey"
            columns: ["c_channel_id"]
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_tax_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel_map_warehouse: {
        Row: {
          ad_org_id: number
          c_channel_id: number
          created: string
          id: number
          isactive: boolean
          m_warehouse_id: number
          resource_id: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          c_channel_id: number
          created?: string
          id?: number
          isactive?: boolean
          m_warehouse_id: number
          resource_id: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          c_channel_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_warehouse_id?: number
          resource_id?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_map_warehouse_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      c_country: {
        Row: {
          ad_org_id: number
          alpha_2: string
          c_currency_id: number | null
          created: string
          full_name: string | null
          id: number
          isactive: boolean
          short_name: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          alpha_2: string
          c_currency_id?: number | null
          created?: string
          full_name?: string | null
          id?: number
          isactive?: boolean
          short_name: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          alpha_2?: string
          c_currency_id?: number | null
          created?: string
          full_name?: string | null
          id?: number
          isactive?: boolean
          short_name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_country_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_country_c_currency_id_fkey"
            columns: ["c_currency_id"]
            referencedRelation: "c_currency"
            referencedColumns: ["id"]
          }
        ]
      }
      c_currency: {
        Row: {
          alphabetic_code: string
          created: string
          cursymbol: string | null
          id: number
          is_enabled: boolean
          minor_unit: number
          name: string
          numeric_code: string
          updated: string
        }
        Insert: {
          alphabetic_code: string
          created?: string
          cursymbol?: string | null
          id?: number
          is_enabled?: boolean
          minor_unit?: number
          name: string
          numeric_code: string
          updated?: string
        }
        Update: {
          alphabetic_code?: string
          created?: string
          cursymbol?: string | null
          id?: number
          is_enabled?: boolean
          minor_unit?: number
          name?: string
          numeric_code?: string
          updated?: string
        }
        Relationships: []
      }
      c_loc_address: {
        Row: {
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          municipality_id: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          municipality_id: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          municipality_id?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_loc_address_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_loc_address_municipality_id_fkey"
            columns: ["municipality_id"]
            referencedRelation: "c_loc_municipality"
            referencedColumns: ["code"]
          }
        ]
      }
      c_loc_municipality: {
        Row: {
          ad_org_id: number
          code: string
          created: string
          id: number
          isactive: boolean
          name: string
          region_id: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          code: string
          created?: string
          id?: number
          isactive?: boolean
          name: string
          region_id: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          name?: string
          region_id?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_loc_municipality_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_loc_municipality_region_id_fkey"
            columns: ["region_id"]
            referencedRelation: "c_loc_region"
            referencedColumns: ["code"]
          }
        ]
      }
      c_loc_region: {
        Row: {
          code: string
          created: string
          id: number
          name: string
          parent_region: string | null
          type: Database["public"]["Enums"]["region_type"] | null
          updated: string
        }
        Insert: {
          code: string
          created?: string
          id?: number
          name: string
          parent_region?: string | null
          type?: Database["public"]["Enums"]["region_type"] | null
          updated?: string
        }
        Update: {
          code?: string
          created?: string
          id?: number
          name?: string
          parent_region?: string | null
          type?: Database["public"]["Enums"]["region_type"] | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_loc_region_parent_region_fkey"
            columns: ["parent_region"]
            referencedRelation: "c_loc_region"
            referencedColumns: ["code"]
          }
        ]
      }
      c_loc_settlement: {
        Row: {
          ad_org_id: number
          code: string
          created: string
          id: number
          isactive: boolean
          municipality_id: string | null
          name: string
          updated: string
        }
        Insert: {
          ad_org_id?: number
          code: string
          created?: string
          id?: number
          isactive?: boolean
          municipality_id?: string | null
          name: string
          updated?: string
        }
        Update: {
          ad_org_id?: number
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          municipality_id?: string | null
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_loc_settlement_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_loc_settlement_municipality_id_fkey"
            columns: ["municipality_id"]
            referencedRelation: "c_loc_municipality"
            referencedColumns: ["code"]
          }
        ]
      }
      c_location: {
        Row: {
          address1: string | null
          address2: string | null
          c_country_id: number | null
          c_loc_municipality_id: number | null
          c_region_id: number | null
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          c_country_id?: number | null
          c_loc_municipality_id?: number | null
          c_region_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          c_country_id?: number | null
          c_loc_municipality_id?: number | null
          c_region_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_location_c_country_id_fkey"
            columns: ["c_country_id"]
            referencedRelation: "c_country"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_location_c_loc_municipality_id_fkey"
            columns: ["c_loc_municipality_id"]
            referencedRelation: "c_loc_municipality"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_location_c_region_id_fkey"
            columns: ["c_region_id"]
            referencedRelation: "c_loc_region"
            referencedColumns: ["id"]
          }
        ]
      }
      c_postal: {
        Row: {
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: []
      }
      c_tax: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_taxcategory_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          isdefault: boolean
          name: string
          rate: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_taxcategory_id: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name: string
          rate: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_taxcategory_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name?: string
          rate?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_tax_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_tax_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_tax_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          }
        ]
      }
      c_taxcategory: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          isdefault: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_taxcategory_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_taxcategory_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_uom: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          isdefault: boolean
          name: string
          stdprecision: number
          uomsymbol: string | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name: string
          stdprecision: number
          uomsymbol?: string | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isdefault?: boolean
          name?: string
          stdprecision?: number
          uomsymbol?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_uom_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_uom_conversion: {
        Row: {
          ad_client_id: number | null
          ad_org_id: number | null
          c_uom_id: number | null
          c_uom_to_id: number | null
          created: string
          dividerate: number | null
          id: number
          isactive: boolean | null
          m_product_id: number | null
          multiplyrate: number | null
          updated: string | null
        }
        Insert: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          c_uom_id?: number | null
          c_uom_to_id?: number | null
          created?: string
          dividerate?: number | null
          id?: number
          isactive?: boolean | null
          m_product_id?: number | null
          multiplyrate?: number | null
          updated?: string | null
        }
        Update: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          c_uom_id?: number | null
          c_uom_to_id?: number | null
          created?: string
          dividerate?: number | null
          id?: number
          isactive?: boolean | null
          m_product_id?: number | null
          multiplyrate?: number | null
          updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "c_uom_conversion_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
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
      crud_history: {
        Row: {
          changed_data: string
          created_at: string
          id: number
          sku: string
          status: boolean
        }
        Insert: {
          changed_data: string
          created_at?: string
          id?: number
          sku: string
          status?: boolean
        }
        Update: {
          changed_data?: string
          created_at?: string
          id?: number
          sku?: string
          status?: boolean
        }
        Relationships: []
      }
      m_attribute: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          attribute_group_id: number
          attribute_type: string | null
          attributevaluetype: string
          backend_type: string | null
          code: string
          created: string
          description: string | null
          id: number
          isactive: boolean
          isinstanceattribute: boolean
          ismandatory: boolean
          label: string | null
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          attribute_group_id?: number
          attribute_type?: string | null
          attributevaluetype?: string
          backend_type?: string | null
          code: string
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isinstanceattribute?: boolean
          ismandatory?: boolean
          label?: string | null
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          attribute_group_id?: number
          attribute_type?: string | null
          attributevaluetype?: string
          backend_type?: string | null
          code?: string
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isinstanceattribute?: boolean
          ismandatory?: boolean
          label?: string | null
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attribute_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attribute_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attribute_attribute_group_id_fkey"
            columns: ["attribute_group_id"]
            referencedRelation: "m_attributegroup"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributegroup: {
        Row: {
          code: string
          created: string
          id: number
          label: string | null
          updated: string
        }
        Insert: {
          code: string
          created?: string
          id?: number
          label?: string | null
          updated?: string
        }
        Update: {
          code?: string
          created?: string
          id?: number
          label?: string | null
          updated?: string
        }
        Relationships: []
      }
      m_attributeinstance: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          isactive: boolean
          m_attribute_id: number
          m_attributesetinstance_id: number
          m_attributevalue_id: number | null
          updated: string
          value: string | null
          valuedate: string | null
          valuenumber: number | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          isactive?: boolean
          m_attribute_id?: number
          m_attributesetinstance_id: number
          m_attributevalue_id?: number | null
          updated?: string
          value?: string | null
          valuedate?: string | null
          valuenumber?: number | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          isactive?: boolean
          m_attribute_id?: number
          m_attributesetinstance_id?: number
          m_attributevalue_id?: number | null
          updated?: string
          value?: string | null
          valuedate?: string | null
          valuenumber?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeinstance_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attributesetinstance_id_fkey"
            columns: ["m_attributesetinstance_id"]
            referencedRelation: "m_attributesetinstance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attributevalue_id_fkey"
            columns: ["m_attributevalue_id"]
            referencedRelation: "m_attributevalue"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributeset: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          isguaranteedate: boolean
          isinstanceattribute: boolean
          mandatorytype: string
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isguaranteedate?: boolean
          isinstanceattribute?: boolean
          mandatorytype?: string
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isguaranteedate?: boolean
          isinstanceattribute?: boolean
          mandatorytype?: string
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeset_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeset_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributesetinstance: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          guaranteedate: string | null
          id: number
          isactive: boolean
          lot: string | null
          m_attributeset_id: number | null
          serno: string | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          guaranteedate?: string | null
          id?: number
          isactive?: boolean
          lot?: string | null
          m_attributeset_id?: number | null
          serno?: string | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          guaranteedate?: string | null
          id?: number
          isactive?: boolean
          lot?: string | null
          m_attributeset_id?: number | null
          serno?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributesetinstance_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributesetinstance_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributesetinstance_m_attributeset_id_fkey"
            columns: ["m_attributeset_id"]
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributeuse: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          isactive: boolean
          m_attribute_id: number
          m_attributeset_id: number
          seqno: number | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          isactive?: boolean
          m_attribute_id: number
          m_attributeset_id: number
          seqno?: number | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          isactive?: boolean
          m_attribute_id?: number
          m_attributeset_id?: number
          seqno?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeuse_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_m_attributeset_id_fkey"
            columns: ["m_attributeset_id"]
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributevalue: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          m_attribute_id: number
          name: string
          updated: string
          value: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_attribute_id: number
          name: string
          updated?: string
          value: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_attribute_id?: number
          name?: string
          updated?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributevalue_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributevalue_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributevalue_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          }
        ]
      }
      m_discountschema: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          flatdiscount: number | null
          id: number
          isactive: boolean
          name: string
          updated: string
          validfrom: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          flatdiscount?: number | null
          id?: number
          isactive?: boolean
          name: string
          updated?: string
          validfrom?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          flatdiscount?: number | null
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
          validfrom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_discountschema_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschema_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      m_locator: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          isdefault: boolean
          m_warehouse_id: number
          updated: string
          value: string
          x: string | null
          y: string | null
          z: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          isdefault?: boolean
          m_warehouse_id: number
          updated?: string
          value: string
          x?: string | null
          y?: string | null
          z?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          isdefault?: boolean
          m_warehouse_id?: number
          updated?: string
          value?: string
          x?: string | null
          y?: string | null
          z?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_locator_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_locator_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_locator_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          }
        ]
      }
      m_pricelist: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          basepricelist_id: number | null
          c_currency_id: number
          created: string
          description: string | null
          enforcepricelimit: boolean
          id: number
          isactive: boolean
          isdefault: boolean
          issopricelist: boolean
          istaxincluded: boolean | null
          name: string
          priceprecision: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          basepricelist_id?: number | null
          c_currency_id: number
          created?: string
          description?: string | null
          enforcepricelimit?: boolean
          id?: number
          isactive?: boolean
          isdefault?: boolean
          issopricelist?: boolean
          istaxincluded?: boolean | null
          name: string
          priceprecision?: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          basepricelist_id?: number | null
          c_currency_id?: number
          created?: string
          description?: string | null
          enforcepricelimit?: boolean
          id?: number
          isactive?: boolean
          isdefault?: boolean
          issopricelist?: boolean
          istaxincluded?: boolean | null
          name?: string
          priceprecision?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_pricelist_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_pricelist_version: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          m_discountschema_id: number
          m_pricelist_id: number
          m_pricelist_version_base_id: number | null
          name: string
          updated: string
          validfrom: string
          validto: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_discountschema_id: number
          m_pricelist_id: number
          m_pricelist_version_base_id?: number | null
          name: string
          updated?: string
          validfrom: string
          validto?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_discountschema_id?: number
          m_pricelist_id?: number
          m_pricelist_version_base_id?: number | null
          name?: string
          updated?: string
          validfrom?: string
          validto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_pricelist_version_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_product: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          attributes: Json | null
          barcode: string | null
          brand: string | null
          c_taxcategory_id: number
          c_uom_id: number
          condition: string | null
          created: string
          description: string | null
          descriptionurl: string | null
          discontinued: boolean
          featuredAssetId: number | null
          id: number
          imageurl: string | null
          isactive: boolean
          isselfservice: boolean
          m_attributeset_id: number | null
          m_product_category_id: number | null
          m_product_uu: string | null
          mpn: string | null
          name: string
          net_qty_uom_id: number | null
          net_quantity: number
          producttype: string
          shelf_life: number | null
          sku: string | null
          unitsperpack: number
          unitsperpallet: number | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          attributes?: Json | null
          barcode?: string | null
          brand?: string | null
          c_taxcategory_id: number
          c_uom_id?: number
          condition?: string | null
          created?: string
          description?: string | null
          descriptionurl?: string | null
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          isactive?: boolean
          isselfservice?: boolean
          m_attributeset_id?: number | null
          m_product_category_id?: number | null
          m_product_uu?: string | null
          mpn?: string | null
          name: string
          net_qty_uom_id?: number | null
          net_quantity?: number
          producttype?: string
          shelf_life?: number | null
          sku?: string | null
          unitsperpack?: number
          unitsperpallet?: number | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          attributes?: Json | null
          barcode?: string | null
          brand?: string | null
          c_taxcategory_id?: number
          c_uom_id?: number
          condition?: string | null
          created?: string
          description?: string | null
          descriptionurl?: string | null
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          isactive?: boolean
          isselfservice?: boolean
          m_attributeset_id?: number | null
          m_product_category_id?: number | null
          m_product_uu?: string | null
          mpn?: string | null
          name?: string
          net_qty_uom_id?: number | null
          net_quantity?: number
          producttype?: string
          shelf_life?: number | null
          sku?: string | null
          unitsperpack?: number
          unitsperpallet?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
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
            columns: ["m_attributeset_id"]
            referencedRelation: "m_attributeset"
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
          }
        ]
      }
      m_product_category: {
        Row: {
          created: string
          description: string | null
          id: number
          isactive: boolean
          isselfservice: boolean
          name: string
          parent_id: number | null
          updated: string
        }
        Insert: {
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name: string
          parent_id?: number | null
          updated?: string
        }
        Update: {
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name?: string
          parent_id?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_category_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          }
        ]
      }
      m_product_gtin: {
        Row: {
          ad_org_id: number
          created: string
          gtin: string
          id: number
          isactive: boolean
          m_product_id: number
          updated: string
        }
        Insert: {
          ad_org_id?: number
          created?: string
          gtin: string
          id?: number
          isactive?: boolean
          m_product_id: number
          updated?: string
        }
        Update: {
          ad_org_id?: number
          created?: string
          gtin?: string
          id?: number
          isactive?: boolean
          m_product_id?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_gtin_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_gtin_m_product_id_fkey"
            columns: ["m_product_id"]
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          }
        ]
      }
      m_product_po: {
        Row: {
          barcode: string | null
          c_bpartner_id: number
          c_currency_id: number | null
          c_uom_id: number | null
          created: string
          discontinued: boolean | null
          id: number
          isactive: boolean
          iscurrentvendor: boolean
          m_product_id: number
          manufacturer: string | null
          priceeffective: string | null
          pricelastinv: number | null
          pricelastpo: number | null
          pricelist: number
          pricepo: number | null
          updated: string
          url: string | null
          vendorcategory: string | null
          vendorproductno: string
        }
        Insert: {
          barcode?: string | null
          c_bpartner_id: number
          c_currency_id?: number | null
          c_uom_id?: number | null
          created?: string
          discontinued?: boolean | null
          id?: number
          isactive?: boolean
          iscurrentvendor?: boolean
          m_product_id: number
          manufacturer?: string | null
          priceeffective?: string | null
          pricelastinv?: number | null
          pricelastpo?: number | null
          pricelist?: number
          pricepo?: number | null
          updated?: string
          url?: string | null
          vendorcategory?: string | null
          vendorproductno: string
        }
        Update: {
          barcode?: string | null
          c_bpartner_id?: number
          c_currency_id?: number | null
          c_uom_id?: number | null
          created?: string
          discontinued?: boolean | null
          id?: number
          isactive?: boolean
          iscurrentvendor?: boolean
          m_product_id?: number
          manufacturer?: string | null
          priceeffective?: string | null
          pricelastinv?: number | null
          pricelastpo?: number | null
          pricelist?: number
          pricepo?: number | null
          updated?: string
          url?: string | null
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
          }
        ]
      }
      m_productprice: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          m_pricelist_version_id: number
          m_product_id: number
          pricelimit: number | null
          pricelist: number | null
          pricestd: number | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_version_id: number
          m_product_id: number
          pricelimit?: number | null
          pricelist?: number | null
          pricestd?: number | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_version_id?: number
          m_product_id?: number
          pricelimit?: number | null
          pricelist?: number | null
          pricestd?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_productprice_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_productprice_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_replenish: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          level_max: number
          level_min: number
          m_locator_id: number | null
          m_product_id: number
          m_replenish_uu: string | null
          m_warehouse_id: number
          m_warehousesource_id: number | null
          qtybatchsize: number | null
          replenishtype: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          level_max?: number
          level_min?: number
          m_locator_id?: number | null
          m_product_id: number
          m_replenish_uu?: string | null
          m_warehouse_id: number
          m_warehousesource_id?: number | null
          qtybatchsize?: number | null
          replenishtype?: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          level_max?: number
          level_min?: number
          m_locator_id?: number | null
          m_product_id?: number
          m_replenish_uu?: string | null
          m_warehouse_id?: number
          m_warehousesource_id?: number | null
          qtybatchsize?: number | null
          replenishtype?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_replenish_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_storageonhand: {
        Row: {
          ad_client_id: number | null
          ad_org_id: number | null
          created: string
          id: number
          isactive: boolean | null
          m_locator_id: number | null
          m_product_id: number
          qtyonhand: number
          updated: string
          warehouse_id: number
        }
        Insert: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          created?: string
          id?: number
          isactive?: boolean | null
          m_locator_id?: number | null
          m_product_id: number
          qtyonhand: number
          updated?: string
          warehouse_id: number
        }
        Update: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          created?: string
          id?: number
          isactive?: boolean | null
          m_locator_id?: number | null
          m_product_id?: number
          qtyonhand?: number
          updated?: string
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "m_storageonhand_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_substitute: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          isactive: boolean
          m_product_id: number
          name: string | null
          substitute_id: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          isactive?: boolean
          m_product_id: number
          name?: string | null
          substitute_id: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          isactive?: boolean
          m_product_id?: number
          name?: string | null
          substitute_id?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_substitute_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_substitute_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      m_warehouse: {
        Row: {
          ad_client_id: number
          ad_org_id: number | null
          code: string
          created: string
          id: number
          isactive: boolean
          isselfservice: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number | null
          code: string
          created?: string
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number | null
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_warehouse_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          }
        ]
      }
      w_basket: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          ad_user_id: number
          c_bpartner_id: number | null
          created: string
          id: number
          isactive: boolean
          m_pricelist_id: number | null
          session_id: string | null
          updated: string
          w_basket_uu: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          ad_user_id: number
          c_bpartner_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_id?: number | null
          session_id?: string | null
          updated?: string
          w_basket_uu?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          ad_user_id?: number
          c_bpartner_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_id?: number | null
          session_id?: string | null
          updated?: string
          w_basket_uu?: string
        }
        Relationships: [
          {
            foreignKeyName: "w_basket_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      w_basketline: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          m_product_id: number | null
          price: number
          product: string | null
          qty: number
          updated: string
          w_basket_id: number
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_product_id?: number | null
          price?: number
          product?: string | null
          qty?: number
          updated?: string
          w_basket_id: number
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          m_product_id?: number | null
          price?: number
          product?: string | null
          qty?: number
          updated?: string
          w_basket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "w_basketline_ad_client_id_fkey"
            columns: ["ad_client_id"]
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basketline_ad_org_id_fkey"
            columns: ["ad_org_id"]
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      is_valid_gtin: {
        Args: {
          barcode: string
        }
        Returns: boolean
      }
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
      Entity: "Category" | "Source" | "Uom" | "Tax"
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
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
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
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
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
