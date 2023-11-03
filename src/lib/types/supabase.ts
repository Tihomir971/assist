export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      _template: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "_template_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_template_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
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
        Relationships: [
          {
            foreignKeyName: "ad_client_ad_language_fkey"
            columns: ["ad_language"]
            isOneToOne: false
            referencedRelation: "ad_language"
            referencedColumns: ["ad_language"]
          }
        ]
      }
      ad_language: {
        Row: {
          ad_client_id: number
          ad_language: string
          ad_org_id: number
          countrycode: string | null
          created: string
          id: number
          isactive: boolean
          languageiso: string | null
          name: string
          updated: string
        }
        Insert: {
          ad_client_id: number
          ad_language: string
          ad_org_id?: number
          countrycode?: string | null
          created?: string
          id?: number
          isactive?: boolean
          languageiso?: string | null
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_language?: string
          ad_org_id?: number
          countrycode?: string | null
          created?: string
          id?: number
          isactive?: boolean
          languageiso?: string | null
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_language_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_language_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_message: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isErrorMsg: boolean
          msgText: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isErrorMsg?: boolean
          msgText: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isErrorMsg?: boolean
          msgText?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_message_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_message_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_note: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          ad_user_id: string | null
          created: string
          description: string | null
          id: number
          isactive: boolean
          processed: boolean
          textMsg: string | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          ad_user_id?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          processed?: boolean
          textMsg?: string | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          ad_user_id?: string | null
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          processed?: boolean
          textMsg?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_note_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_note_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_note_ad_user_id_fkey"
            columns: ["ad_user_id"]
            isOneToOne: false
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          }
        ]
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
            isOneToOne: true
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_user: {
        Row: {
          ad_client_id: number
          avatar_url: string | null
          created: string
          id: string
          isactive: boolean
          name: string | null
          supervisor_id: string | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          avatar_url?: string | null
          created?: string
          id: string
          isactive?: boolean
          name?: string | null
          supervisor_id?: string | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          avatar_url?: string | null
          created?: string
          id?: string
          isactive?: boolean
          name?: string | null
          supervisor_id?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_user_client: {
        Row: {
          ad_clent_id: number
          auth_user_id: string
          created: string
          id: number
          updated: string
        }
        Insert: {
          ad_clent_id: number
          auth_user_id: string
          created?: string
          id?: number
          updated?: string
        }
        Update: {
          ad_clent_id?: number
          auth_user_id?: string
          created?: string
          id?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_user_client_ad_clent_id_fkey"
            columns: ["ad_clent_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_client_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_user_orgaccess: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          ad_user_id: string
          created: string
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_client_id: number
          ad_org_id: number
          ad_user_id: string
          created?: string
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          ad_user_id?: string
          created?: string
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_user_orgaccess_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_orgaccess_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_orgaccess_ad_user_id_fkey"
            columns: ["ad_user_id"]
            isOneToOne: false
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
      attribute_option: {
        Row: {
          attribute_id: number
          code: string
          created_at: string
          id: number
          label: string | null
          updated: string
        }
        Insert: {
          attribute_id: number
          code: string
          created_at?: string
          id?: number
          label?: string | null
          updated?: string
        }
        Update: {
          attribute_id?: number
          code?: string
          created_at?: string
          id?: number
          label?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attribute_option_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          }
        ]
      }
      c_area: {
        Row: {
          code: string
          created: string
          name: string
          parent: string | null
          updated: string
        }
        Insert: {
          code: string
          created?: string
          name: string
          parent?: string | null
          updated?: string
        }
        Update: {
          code?: string
          created?: string
          name?: string
          parent?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_area_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "c_area"
            referencedColumns: ["code"]
          }
        ]
      }
      c_bpartner: {
        Row: {
          ad_client_id: number
          ad_language: string | null
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          m_pricelist_id: number | null
          name: string
          po_pricelist_id: number | null
          taxid: string | null
          updated: string
          value: string
        }
        Insert: {
          ad_client_id?: number
          ad_language?: string | null
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_id?: number | null
          name: string
          po_pricelist_id?: number | null
          taxid?: string | null
          updated?: string
          value: string
        }
        Update: {
          ad_client_id?: number
          ad_language?: string | null
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_pricelist_id?: number | null
          name?: string
          po_pricelist_id?: number | null
          taxid?: string | null
          updated?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_bpartner_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_bpartner_po_pricelist_id_fkey"
            columns: ["po_pricelist_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          }
        ]
      }
      c_cart: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          processed: boolean
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          processed?: boolean
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          processed?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_cart_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_cart_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_cartline: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_order_id: number
          c_uom_id: number
          created: string
          id: number
          isactive: boolean
          m_product_id: number
          priceentered: number
          qtyentered: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_order_id: number
          c_uom_id: number
          created?: string
          id?: number
          isactive?: boolean
          m_product_id: number
          priceentered: number
          qtyentered: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_order_id?: number
          c_uom_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_product_id?: number
          priceentered?: number
          qtyentered?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_cartline_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_cartline_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_cartline_c_order_id_fkey"
            columns: ["c_order_id"]
            isOneToOne: false
            referencedRelation: "c_cart"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_cartline_c_uom_id_fkey"
            columns: ["c_uom_id"]
            isOneToOne: false
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_cartline_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          code: string
          created: string
          description: string | null
          id: number
          isactive: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          code: string
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          code?: string
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel_node: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_channel_id: number
          code: string
          created: string
          id: number
          isactive: boolean
          node_id: number
          parent_id: number | null
          product_category_id: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id: number
          code: string
          created?: string
          id?: number
          isactive?: boolean
          node_id: number
          parent_id?: number | null
          product_category_id: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id?: number
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          node_id?: number
          parent_id?: number | null
          product_category_id?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_node_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_node_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_node_c_channel_id_fkey"
            columns: ["c_channel_id"]
            isOneToOne: false
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_node_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          }
        ]
      }
      c_channel_params: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_channel_id: number
          created: string
          id: number
          isactive: boolean
          key: string
          updated: string
          value: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id: number
          created?: string
          id?: number
          isactive?: boolean
          key: string
          updated?: string
          value?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_channel_id?: number
          created?: string
          id?: number
          isactive?: boolean
          key?: string
          updated?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "c_channel_params_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_params_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_params_c_channel_id_fkey"
            columns: ["c_channel_id"]
            isOneToOne: false
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          }
        ]
      }
      c_country: {
        Row: {
          alpha_2_code: string
          alpha3Code: string
          country_uu: string
          created: string
          isActive: boolean
          label: string
          name: string
          numeric: string
          regionName: string | null
          "Sub-regionName": string | null
          updated: string
        }
        Insert: {
          alpha_2_code: string
          alpha3Code: string
          country_uu?: string
          created?: string
          isActive?: boolean
          label: string
          name: string
          numeric: string
          regionName?: string | null
          "Sub-regionName"?: string | null
          updated?: string
        }
        Update: {
          alpha_2_code?: string
          alpha3Code?: string
          country_uu?: string
          created?: string
          isActive?: boolean
          label?: string
          name?: string
          numeric?: string
          regionName?: string | null
          "Sub-regionName"?: string | null
          updated?: string
        }
        Relationships: []
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
      c_municipality: {
        Row: {
          code: string
          created: string
          id: number
          name: string
          parent: string | null
          updated: string | null
        }
        Insert: {
          code: string
          created?: string
          id?: number
          name: string
          parent?: string | null
          updated?: string | null
        }
        Update: {
          code?: string
          created?: string
          id?: number
          name?: string
          parent?: string | null
          updated?: string | null
        }
        Relationships: []
      }
      c_settlement: {
        Row: {
          code: string
          created: string
          id: number
          manicipalityCode: string
          name: string
          updated: string
        }
        Insert: {
          code: string
          created?: string
          id?: number
          manicipalityCode: string
          name: string
          updated?: string
        }
        Update: {
          code?: string
          created?: string
          id?: number
          manicipalityCode?: string
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_settlement_manicipalityCode_fkey"
            columns: ["manicipalityCode"]
            isOneToOne: false
            referencedRelation: "c_municipality"
            referencedColumns: ["code"]
          }
        ]
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_tax_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_tax_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_taxcategory_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      c_uom_conversion: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_uom_id: number
          c_uom_to_id: number
          created: string
          dividerate: number
          id: number
          isactive: boolean
          m_product_id: number | null
          multiplyrate: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_uom_id: number
          c_uom_to_id: number
          created?: string
          dividerate?: number
          id?: number
          isactive?: boolean
          m_product_id?: number | null
          multiplyrate?: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_uom_id?: number
          c_uom_to_id?: number
          created?: string
          dividerate?: number
          id?: number
          isactive?: boolean
          m_product_id?: number | null
          multiplyrate?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_uom_conversion_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_c_uom_id_fkey"
            columns: ["c_uom_id"]
            isOneToOne: false
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_c_uom_to_id_fkey"
            columns: ["c_uom_to_id"]
            isOneToOne: false
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          }
        ]
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
      eav_attribute: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          backend_type: string | null
          code: string
          created: string
          entity_type_id: number
          frontend_input: string
          id: number
          isactive: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          backend_type?: string | null
          code: string
          created?: string
          entity_type_id?: number
          frontend_input?: string
          id?: number
          isactive?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          backend_type?: string | null
          code?: string
          created?: string
          entity_type_id?: number
          frontend_input?: string
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "eav_attribute_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eav_attribute_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eav_attribute_entity_type_id_fkey"
            columns: ["entity_type_id"]
            isOneToOne: false
            referencedRelation: "eav_entity_type"
            referencedColumns: ["id"]
          }
        ]
      }
      eav_attribute_group: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          code: string
          created: string
          id: number
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          code: string
          created?: string
          id?: number
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          code?: string
          created?: string
          id?: number
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "eav_attribute_group_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eav_attribute_group_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      eav_attribute_option: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          code: string
          created: string
          eav_attribute_id: number
          id: number
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          code: string
          created?: string
          eav_attribute_id: number
          id?: number
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          code?: string
          created?: string
          eav_attribute_id?: number
          id?: number
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "eav_attribute_option_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eav_attribute_option_eav_attribute_id_fkey"
            columns: ["eav_attribute_id"]
            isOneToOne: false
            referencedRelation: "eav_attribute"
            referencedColumns: ["id"]
          }
        ]
      }
      eav_entity_type: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          code: string
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          code: string
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "eav_entity_type_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eav_entity_type_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attribute: {
        Row: {
          attribute_group_id: number
          attribute_type: string | null
          attributevaluetype: string
          backend_type: string | null
          code: string
          created: string
          id: number
          isactive: boolean
          label: string | null
          name: string
          updated: string
        }
        Insert: {
          attribute_group_id?: number
          attribute_type?: string | null
          attributevaluetype: string
          backend_type?: string | null
          code: string
          created?: string
          id?: number
          isactive?: boolean
          label?: string | null
          name: string
          updated?: string
        }
        Update: {
          attribute_group_id?: number
          attribute_type?: string | null
          attributevaluetype?: string
          backend_type?: string | null
          code?: string
          created?: string
          id?: number
          isactive?: boolean
          label?: string | null
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attribute_attribute_group_id_fkey"
            columns: ["attribute_group_id"]
            isOneToOne: false
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
      m_attributeset: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          name: string
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          name: string
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          name?: string
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeset_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeset_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      m_attributeuse: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          m_attribute_id: number
          m_attributeset_id: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id: number
          isactive?: boolean
          m_attribute_id: number
          m_attributeset_id: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          m_attribute_id?: number
          m_attributeset_id?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_attributeuse_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            isOneToOne: false
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeuse_m_attributeset_id_fkey"
            columns: ["m_attributeset_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributevalue_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributevalue_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschema_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      m_discountschemaline: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          c_bpartner_id: number | null
          created: string
          id: number
          isactive: boolean
          m_discountschema_id: number
          m_product_category_id: number | null
          m_product_id: number | null
          seqno: number
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          c_bpartner_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          m_discountschema_id: number
          m_product_category_id?: number | null
          m_product_id?: number | null
          seqno: number
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          c_bpartner_id?: number | null
          created?: string
          id?: number
          isactive?: boolean
          m_discountschema_id?: number
          m_product_category_id?: number | null
          m_product_id?: number | null
          seqno?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_discountschemaline_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschemaline_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschemaline_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            isOneToOne: false
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschemaline_m_discountschema_id_fkey"
            columns: ["m_discountschema_id"]
            isOneToOne: false
            referencedRelation: "m_discountschema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschemaline_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            isOneToOne: false
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_discountschemaline_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_locator_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_locator_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_basepricelist_id_fkey"
            columns: ["basepricelist_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_c_currency_id_fkey"
            columns: ["c_currency_id"]
            isOneToOne: false
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
        }
        Relationships: [
          {
            foreignKeyName: "m_pricelist_version_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_m_discountschema_id_fkey"
            columns: ["m_discountschema_id"]
            isOneToOne: false
            referencedRelation: "m_discountschema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_pricelist_version_m_pricelist_version_base_id_fkey"
            columns: ["m_pricelist_version_base_id"]
            isOneToOne: false
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
          discontinued: boolean
          featuredAssetId: number | null
          id: number
          imageurl: string | null
          isactive: boolean
          isselfservice: boolean
          m_attributeset_id: number | null
          m_product_category_id: number | null
          mpn: string | null
          name: string
          producttype: string
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
          c_taxcategory_id?: number
          c_uom_id?: number
          condition?: string | null
          created?: string
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          isactive?: boolean
          isselfservice?: boolean
          m_attributeset_id?: number | null
          m_product_category_id?: number | null
          mpn?: string | null
          name: string
          producttype?: string
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
          discontinued?: boolean
          featuredAssetId?: number | null
          id?: number
          imageurl?: string | null
          isactive?: boolean
          isselfservice?: boolean
          m_attributeset_id?: number | null
          m_product_category_id?: number | null
          mpn?: string | null
          name?: string
          producttype?: string
          sku?: string | null
          unitsperpack?: number
          unitsperpallet?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_c_taxcategory_id_fkey"
            columns: ["c_taxcategory_id"]
            isOneToOne: false
            referencedRelation: "c_taxcategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_c_uom_id_fkey"
            columns: ["c_uom_id"]
            isOneToOne: false
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_featuredAssetId_fkey"
            columns: ["featuredAssetId"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_m_attributeset_id_fkey"
            columns: ["m_attributeset_id"]
            isOneToOne: false
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_m_product_category_id_fkey"
            columns: ["m_product_category_id"]
            isOneToOne: false
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          }
        ]
      }
      m_product_asset: {
        Row: {
          assetId: number
          created: string
          id: number
          position: number | null
          productId: number
          updated: string
        }
        Insert: {
          assetId: number
          created?: string
          id?: number
          position?: number | null
          productId: number
          updated?: string
        }
        Update: {
          assetId?: number
          created?: string
          id?: number
          position?: number | null
          productId?: number
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_product_asset_assetId_fkey"
            columns: ["assetId"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_asset_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          }
        ]
      }
      m_product_category: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          isselfservice: boolean
          name: string
          parent_id: number | null
          updated: string
          value: string | null
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name: string
          parent_id?: number | null
          updated?: string
          value?: string | null
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          isselfservice?: boolean
          name?: string
          parent_id?: number | null
          updated?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_product_category_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_category_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "m_product_category"
            referencedColumns: ["id"]
          }
        ]
      }
      m_product_po: {
        Row: {
          ad_client_id: number
          ad_org_id: number
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
          ad_client_id?: number
          ad_org_id?: number
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
          ad_client_id?: number
          ad_org_id?: number
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
            foreignKeyName: "m_product_po_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            isOneToOne: false
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_c_currency_id_fkey"
            columns: ["c_currency_id"]
            isOneToOne: false
            referencedRelation: "c_currency"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_c_uom_id_fkey"
            columns: ["c_uom_id"]
            isOneToOne: false
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_product_po_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_productprice_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_productprice_m_pricelist_version_id_fkey"
            columns: ["m_pricelist_version_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_productprice_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
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
          m_product_id: number
          m_warehouse_id: number
          m_warehousesource_id: number | null
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
          m_product_id: number
          m_warehouse_id: number
          m_warehousesource_id?: number | null
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
          m_product_id?: number
          m_warehouse_id?: number
          m_warehousesource_id?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_replenish_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_warehouse_id_fkey"
            columns: ["m_warehouse_id"]
            isOneToOne: false
            referencedRelation: "m_warehouse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_replenish_m_warehousesource_id_fkey"
            columns: ["m_warehousesource_id"]
            isOneToOne: false
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
          qtyonhand?: number
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_m_locator_id_fkey"
            columns: ["m_locator_id"]
            isOneToOne: false
            referencedRelation: "m_locator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_storageonhand_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "m_warehouse"
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          }
        ]
      }
      "mage_categ_link.for_delete": {
        Row: {
          id: number
          mage_id: number
          product_category_id: number
        }
        Insert: {
          id?: number
          mage_id: number
          product_category_id: number
        }
        Update: {
          id?: number
          mage_id?: number
          product_category_id?: number
        }
        Relationships: []
      }
      product_category: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          description: string | null
          id: number
          isactive: boolean
          name: string
          parent_id: number | null
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name: string
          parent_id?: number | null
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          description?: string | null
          id?: number
          isactive?: boolean
          name?: string
          parent_id?: number | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      product_type: {
        Row: {
          code: string
          created: string
          id: number
          is_enabled: boolean
          name: string
          updated: string
        }
        Insert: {
          code: string
          created?: string
          id?: number
          is_enabled?: boolean
          name: string
          updated: string
        }
        Update: {
          code?: string
          created?: string
          id?: number
          is_enabled?: boolean
          name?: string
          updated?: string
        }
        Relationships: []
      }
      product_variant_asset: {
        Row: {
          ad_client_id: number
          ad_org_id: number
          created: string
          id: number
          isactive: boolean
          updated: string
        }
        Insert: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Update: {
          ad_client_id?: number
          ad_org_id?: number
          created?: string
          id?: number
          isactive?: boolean
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_asset_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_asset_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created: string
          id: string
          updated: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created?: string
          id: string
          updated?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created?: string
          id?: string
          updated?: string
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey1"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      trstanje: {
        Row: {
          naziv: string | null
          sifobj: string
          sifra: string
        }
        Insert: {
          naziv?: string | null
          sifobj: string
          sifra: string
        }
        Update: {
          naziv?: string | null
          sifobj?: string
          sifra?: string
        }
        Relationships: []
      }
      web_catalog: {
        Row: {
          ad_client_id: number | null
          ad_org_id: number | null
          code: string | null
          created: string
          id: number
          isactive: boolean
          name: string | null
          updated: string
        }
        Insert: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          code?: string | null
          created?: string
          id?: number
          isactive?: boolean
          name?: string | null
          updated?: string
        }
        Update: {
          ad_client_id?: number | null
          ad_org_id?: number | null
          code?: string | null
          created?: string
          id?: number
          isactive?: boolean
          name?: string | null
          updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_catalog_ad_client_id_fkey"
            columns: ["ad_client_id"]
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_catalog_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      c_channel_get_node_link: {
        Args: {
          p_channel_id: number
          p_client_id: number
          p_org_id: number
        }
        Returns: {
          id: number
          name: string
          mage_id: number
          parent_id: number
          parent_mage_id: number
          enabled: boolean
        }[]
      }
      c_channel_store_mage_categ_link: {
        Args: {
          categ_name: string
          product_categ_id: number
          mage_categ_id: number
          prod_categ_parent_id: number
          channel_id: number
          org_id: number
          client_id: number
        }
        Returns: number
      }
      get_mage_categ_links: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          name: string
          mage_id: number
          parent_id: number
          parent_mage_id: number
        }[]
      }
      store_mage_categ_link: {
        Args: {
          product_categ_id: number
          mage_categ_id: number
        }
        Returns: number
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
