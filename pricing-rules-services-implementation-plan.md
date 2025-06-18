# Pricing Rules Services Implementation Plan

## 🎯 Cilj
Kreirati servise za lookup podatke potrebne za strukturirano uređivanje JSON-a u pricing rules formi.

## 📋 Servisi za kreiranje

### 1. PartnerService
**Fajl:** `src/lib/services/supabase/partner.service.ts`

**Tabela:** `c_bpartner`

**Struktura:**
```typescript
export type Partner = Tables<'c_bpartner'>;
export type PartnerCreate = Omit<Partner, 'id' | 'created_at' | 'updated_at'>;
export type PartnerUpdate = Partial<PartnerCreate>;
export type PartnerLookup = { value: number; label: string };
```

**Ključne kolone:**
- `id` - primary key
- `display_name` - za label u lookup
- `is_active` - za filtriranje aktivnih partnera
- `iscustomer`, `isvendor` - tipovi partnera

**Metode:**
- `getById(id: number): Promise<Partner | null>`
- `create(data: PartnerCreate): Promise<Partner>`
- `update(id: number, data: PartnerUpdate): Promise<Partner>`
- `delete(id: number): Promise<void>`
- `list(filters?: Record<string, unknown>): Promise<Partner[]>`
- `getLookup(): Promise<PartnerLookup[]>` - glavna metoda za select opcije

### 2. AttributeService
**Fajl:** `src/lib/services/supabase/attribute.service.ts`

**Tabela:** `m_attribute`

**Struktura:**
```typescript
export type Attribute = Tables<'m_attribute'>;
export type AttributeCreate = Omit<Attribute, 'id' | 'created_at' | 'updated_at'>;
export type AttributeUpdate = Partial<AttributeCreate>;
export type AttributeLookup = { value: number; label: string };
```

**Ključne kolone:**
- `id` - primary key
- `name` - za label u lookup
- `attribute_type` - tip atributa (single_select, multi_select, number, itd.)
- `is_active` - za filtriranje

**Metode:**
- Standardne CRUD operacije
- `getLookup(): Promise<AttributeLookup[]>`
- `getAttributeOptions(attributeId: number): Promise<AttributeOptionLookup[]>` - za opcije atributa

### 3. AttributeOptionService
**Fajl:** `src/lib/services/supabase/attribute-option.service.ts`

**Tabela:** `m_attribute_option`

**Struktura:**
```typescript
export type AttributeOption = Tables<'m_attribute_option'>;
export type AttributeOptionCreate = Omit<AttributeOption, 'id' | 'created_at' | 'updated_at'>;
export type AttributeOptionUpdate = Partial<AttributeOptionCreate>;
export type AttributeOptionLookup = { value: number; label: string };
```

**Ključne kolone:**
- `id` - primary key
- `attribute_id` - foreign key ka m_attribute
- `name` - za label u lookup
- `sort_order` - za sortiranje opcija
- `is_active` - za filtriranje

**Metode:**
- Standardne CRUD operacije
- `getLookup(): Promise<AttributeOptionLookup[]>`
- `getByAttributeId(attributeId: number): Promise<AttributeOption[]>`

## 🔧 Implementacijski detalji

### Template za svaki servis (po ugledu na CategoryService):

```typescript
import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type [Entity] = Tables<'[table_name]'>;
export type [Entity]Create = Omit<[Entity], 'id' | 'created_at' | 'updated_at'>;
export type [Entity]Update = Partial<[Entity]Create>;
export type [Entity]Lookup = { value: number; label: string };

export class [Entity]Service implements CRUDService<[Entity], [Entity]Create, [Entity]Update> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<[Entity] | null> {
		const { data, error } = await this.supabase
			.from('[table_name]')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch [entity]: ${error.message}`);
		return data;
	}

	async create(data: [Entity]Create): Promise<[Entity]> {
		const { data: new[Entity], error } = await this.supabase
			.from('[table_name]')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create [entity]: ${error.message}`);
		if (!new[Entity]) throw new Error('Failed to create [entity]: No data returned');
		return new[Entity];
	}

	async update(id: number, data: [Entity]Update): Promise<[Entity]> {
		const { data: updated[Entity], error } = await this.supabase
			.from('[table_name]')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update [entity]: ${error.message}`);
		if (!updated[Entity]) throw new Error('Failed to update [entity]: No data returned');
		return updated[Entity];
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('[table_name]').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete [entity]: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<[Entity][]> {
		let query = this.supabase.from('[table_name]').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('[sort_column]');
		if (error) throw new Error(`Failed to list [entities]: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<[Entity]Lookup[]> {
		const { data, error } = await this.supabase
			.from('[table_name]')
			.select('value:id, label:[label_column]')
			.eq('is_active', true)
			.order('[label_column]');

		if (error) throw new Error(`Failed to load [entity] lookup: ${error.message}`);
		return data || [];
	}
}
```

## 📊 Specifični detalji za svaki servis

### PartnerService specifičnosti:
- **Label kolona:** `display_name`
- **Sort kolona:** `display_name`
- **Dodatni filteri:** `iscustomer`, `isvendor`

### AttributeService specifičnosti:
- **Label kolona:** `name`
- **Sort kolona:** `name`
- **Dodatna metoda:** `getAttributeOptions(attributeId: number)`

### AttributeOptionService specifičnosti:
- **Label kolona:** `name`
- **Sort kolona:** `sort_order`, zatim `name`
- **Dodatna metoda:** `getByAttributeId(attributeId: number)`

## 🔄 Integracija sa postojećim kodom

### Ažuriranje index.ts fajla:
```typescript
// src/lib/services/supabase/index.ts
export { PartnerService } from './partner.service';
export { AttributeService } from './attribute.service';
export { AttributeOptionService } from './attribute-option.service';
```

### Korišćenje u pricing rules formi:
```typescript
// +page.server.ts
import { PartnerService } from '$lib/services/supabase/partner.service';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { CategoryService } from '$lib/services/supabase/category.service';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  // ... postojeći kod ...
  
  // Dodati lookup podatke
  const [partners, categories, attributes] = await Promise.all([
    new PartnerService(supabase).getLookup(),
    new CategoryService(supabase).getLookup(),
    new AttributeService(supabase).getLookup()
  ]);
  
  return {
    // ... postojeći return ...
    lookupData: { partners, categories, attributes }
  };
};
```

## ✅ Sledeći koraci

1. **Kreirati servise** - implementirati sve tri servisa
2. **Testirati servise** - proveriti da rade lookup metode
3. **Ažurirati pricing rules formu** - dodati lookup podatke u server load
4. **Kreirati builder komponente** - FormulaBuilder i ConditionsBuilder
5. **Integrisati u glavnu formu** - zameniti JSON textarea sa builder komponentama

## 🎯 Očekivani rezultat

Nakon implementacije, imaćemo:
- **PartnerService** sa `getLookup()` metodom za partner_ids select
- **AttributeService** sa `getLookup()` i `getAttributeOptions()` metodama
- **AttributeOptionService** za rad sa opcijama atributa
- **Standardizovane lookup podatke** u formatu `{value: number, label: string}`
- **Type-safe servise** sa kompletnim CRUD operacijama

Ovi servisi će omogućiti kreiranje strukturiranih UI komponenti umesto raw JSON unosa u pricing rules formi.