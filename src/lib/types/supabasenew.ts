export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          },
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
            isOneToOne: true
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            isOneToOne: false
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_user_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          },
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
          created: string
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
          value: string
        }
        Insert: {
          ad_language?: string | null
          created?: string
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
          value: string
        }
        Update: {
          ad_language?: string | null
          created?: string
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
          value?: string
        }
        Relationships: [
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
          },
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
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
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
          entity_type: Database["public"]["Enums"]["Entity"]
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
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_channel_map_c_channel_id_fkey"
            columns: ["c_channel_id"]
            isOneToOne: false
            referencedRelation: "c_channel"
            referencedColumns: ["id"]
          },
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
          },
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
          },
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
          },
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
            isOneToOne: true
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
            isOneToOne: true
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_c_uom_to_id_fkey"
            columns: ["c_uom_to_id"]
            isOneToOne: true
            referencedRelation: "c_uom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_uom_conversion_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attribute_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attribute_attribute_group_id_fkey"
            columns: ["attribute_group_id"]
            isOneToOne: false
            referencedRelation: "m_attributegroup"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attribute_id_fkey"
            columns: ["m_attribute_id"]
            isOneToOne: false
            referencedRelation: "m_attribute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attributesetinstance_id_fkey"
            columns: ["m_attributesetinstance_id"]
            isOneToOne: false
            referencedRelation: "m_attributesetinstance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributeinstance_m_attributevalue_id_fkey"
            columns: ["m_attributevalue_id"]
            isOneToOne: false
            referencedRelation: "m_attributevalue"
            referencedColumns: ["id"]
          },
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
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributesetinstance_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_attributesetinstance_m_attributeset_id_fkey"
            columns: ["m_attributeset_id"]
            isOneToOne: false
            referencedRelation: "m_attributeset"
            referencedColumns: ["id"]
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
            foreignKeyName: "m_replenish_m_locator_id_fkey"
            columns: ["m_locator_id"]
            isOneToOne: false
            referencedRelation: "m_locator"
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
          },
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
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_substitute_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_substitute_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_substitute_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
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
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_ad_user_id_fkey"
            columns: ["ad_user_id"]
            isOneToOne: false
            referencedRelation: "ad_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_c_bpartner_id_fkey"
            columns: ["c_bpartner_id"]
            isOneToOne: false
            referencedRelation: "c_bpartner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basket_m_pricelist_id_fkey"
            columns: ["m_pricelist_id"]
            isOneToOne: false
            referencedRelation: "m_pricelist"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "ad_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basketline_ad_org_id_fkey"
            columns: ["ad_org_id"]
            isOneToOne: false
            referencedRelation: "ad_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basketline_m_product_id_fkey"
            columns: ["m_product_id"]
            isOneToOne: false
            referencedRelation: "m_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "w_basketline_w_basket_id_fkey"
            columns: ["w_basket_id"]
            isOneToOne: false
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
    }
    Enums: {
      Entity: "Category" | "Source"
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

