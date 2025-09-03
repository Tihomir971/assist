# Plan implementacije lokalizacije

## Pregled

Ovaj dokument sadrži detaljni plan za implementaciju sistema lokalizacije koji omogućava korisniku da odabere lokalizaciju za podatke nezavisno od lokalizacije korisničkog interfejsa.

## Arhitektura

Sistem će imati sledeće ključne komponente:

1. **Separaciju UI i Data lokalizacije** - korisnik može imati srpski interfejs ali čitati podatke na engleskom
2. **Server-side i Client-side podršku** za oba slučaja
3. **Svelte store** za reaktivno upravljanje preferencijama
4. **Direktan Supabase pristup** za čuvanje preferencija (bez API endpoint-a)
5. **Integraciju sa postojećim Smart CRUD paternima**

## Plan implementacije

### **Korak 1: Proširenje baze podataka za korisničke preferencije** ✅ ZAVRŠENO

**SQL Migracija:**
```sql
-- Dodaj JSONB kolonu sa default vrednošću
ALTER TABLE ad_user 
ADD COLUMN preferences JSONB DEFAULT '{}';

-- Dodaj CHECK constraint sa direktnim jsonb_matches_schema (kao što već radite)
ALTER TABLE ad_user 
ADD CONSTRAINT check_preferences_schema 
CHECK (
  extensions.jsonb_matches_schema(
    '{
      "type": "object",
      "properties": {
        "preferred_data_locale": {
          "type": "string",
          "pattern": "^[a-z]{2,3}(?:-[A-Za-z]{4})?(?:-[A-Z]{2})?$"
        }
      },
      "additionalProperties": false
    }'::json,
    preferences
  )
);

-- Dodaj indeks za performanse
CREATE INDEX idx_ad_user_preferences_gin ON ad_user USING GIN (preferences);
CREATE INDEX idx_ad_user_data_locale ON ad_user USING GIN ((preferences->>'preferred_data_locale'));
```

### **Korak 2: Kreiranje Svelte store-a za lokalizaciju** ✅ ZAVRŠENO

**LocaleManager klasa sa Svelte 5 runes i direktnim Supabase pristupom**
- Fajl: `src/lib/stores/locale-manager.svelte.ts`
- Koristi $state runes konzistentno sa EnhancedFormStateManager
- Direktan Supabase pristup za ažuriranje preferencija
- Type-safe sa Json casting za Supabase

### **Korak 3: Service klasa za korisničke preferencije** ✅ ZAVRŠENO

**UserPreferencesService sa ispravkama za Supabase Json tipove**
- Fajl: `src/lib/services/supabase/user-preferences.service.ts`
- Helper funkcije za parsing i serialization
- Zod validacija za type safety
- Proper Json type handling

### **Korak 4: ~~API endpoint za čuvanje preferencija~~** ❌ ELIMINISAN

**Razlog:** Direktan Supabase pristup je jednostavniji i konzistentniji

### **Korak 5: Ažuriranje layout servera za učitavanje preferencija** ✅ ZAVRŠENO

**Implementirano u `src/routes/(app)/+layout.server.ts`:**
- Dodati LocaleService i UserPreferencesService
- Dependency tracking sa `depends('user:preferences')`
- Paralelno učitavanje lokala i preferencija
- Fallback logika za default locale
- Strukturirani return sa `localePreferences` objektom

### **Korak 6: Client-side inicijalizacija store-a** ✅ ZAVRŠENO

**Cilj:** Inicijalizacija LocaleManager-a sa server podacima u `+layout.svelte` koristeći Svelte context pattern

**Implementacija:**

**1. Refaktorisanje LocaleManager-a za context pattern:**
```typescript
// src/lib/stores/locale-manager.svelte.ts
import { setContext, getContext } from 'svelte';

const LOCALE_MANAGER_KEY = Symbol('localeManager');

export function setLocaleManagerContext(manager: LocaleManager): void {
  setContext(LOCALE_MANAGER_KEY, manager);
}

export function getLocaleManagerContext(): LocaleManager {
  const manager = getContext<LocaleManager>(LOCALE_MANAGER_KEY);
  if (!manager) {
    throw new Error('LocaleManager not found in context');
  }
  return manager;
}

// Helper funkcije rade transparentno sa context-om
export function getCurrentDataLocale(): string {
  const manager = getLocaleManagerContextSafe();
  return manager?.currentDataLocale || 'sr-Latn-RS';
}
```

**2. Ažuriranje +layout.svelte:**
```svelte
<script lang="ts">
  import { LocaleManager, setLocaleManagerContext } from '$lib/stores/locale-manager.svelte';

  onMount(() => {
    if (data.localePreferences && data.session) {
      try {
        const manager = new LocaleManager(data.supabase, data.session.user.id, {
          preferredDataLocale: data.localePreferences.preferredDataLocale,
          availableLocales: data.localePreferences.availableLocales,
          isLoading: false,
          isUpdating: false,
          lastUpdated: null,
          error: null
        });

        setLocaleManagerContext(manager);
      } catch (error) {
        console.error('Failed to initialize LocaleManager:', error);
      }
    }
  });
</script>
```

**Prednosti context pattern-a:**
- Type-safe pristup LocaleManager-u kroz komponentnu hijerarhiju
- Nema global state mutacije (eliminisan `export let` problem)
- Čist "Svelte way" pristup
- Helper funkcije i dalje rade transparentno
- Error handling za slučaj neuspešne inicijalizacije

**Fajlovi ažurirani:**
- ✅ `src/lib/stores/locale-manager.svelte.ts` - Dodato context API
- ✅ `src/routes/(app)/+layout.svelte` - Inicijalizacija sa context pattern

### **Korak 7: Komponenta za izbor lokalizacije** ✅ ZAVRŠENO

**Cilj:** UI komponenta za menjanje korisničkih preferencija sa naprednim funkcionalnostima

**Implementacija:**

**1. LocalePreferencesCard komponenta:**
```svelte
<!-- src/lib/components/settings/LocalePreferencesCard.svelte -->
<script lang="ts">
  import { getLocaleManagerContext } from '$lib/stores/locale-manager.svelte';
  // Napredna komponenta sa preview funkcionalnostima
</script>
```

**2. Integracija u Settings stranicu:**
```typescript
// src/routes/(app)/account/settings/+page.server.ts
export const load = async ({ locals: { supabase, session } }) => {
  const [availableLocales, userPreferences] = await Promise.all([
    new LocaleService(supabase).getLocales(),
    new UserPreferencesService(supabase).getUserPreferences(session.user.id)
  ]);
  // ...
};
```

**Ključne funkcionalnosti:**
- **Preview Mode**: Prikazuje kako će podaci izgledati u odabranom jeziku
- **Real-time Validation**: Instant feedback o dostupnim opcijama
- **Context Integration**: Koristi LocaleManager iz Svelte context-a
- **Error Handling**: Graceful handling grešaka sa toast notifikacijama
- **Responsive Design**: Optimizovano za sve veličine ekrana
- **Sample Data**: Prikazuje primer podataka u različitim jezicima

**Fajlovi kreirani/ažurirani:**
- ✅ `src/lib/components/settings/LocalePreferencesCard.svelte` - Glavna komponenta
- ✅ `src/routes/(app)/account/settings/+page.server.ts` - Server logika
- ✅ `src/routes/(app)/account/settings/+page.svelte` - Settings stranica

**Napredne funkcionalnosti:**
- Preview mode sa sample podacima u različitim jezicima
- Instant save sa toast feedback-om
- Integration sa postojećim LocaleManager context-om
- Responsive design sa shadcn/ui komponentama

### **Korak 8: Integracija sa Smart CRUD paternima**
**Cilj:** Automatska lokalizacija podataka u postojećim paternima

**Komponente za ažuriranje:**
- Service klase - dodati `getLocalized*` metode
- `SmartForm` - automatska lokalizacija lookup podataka
- `SmartTable` - lokalizovani prikaz kolona
- List page factory - integracija sa locale preferencijama

### **Korak 9: Testiranje i optimizacija**
**Cilj:** Validacija funkcionalnosti i performansi

## Status implementacije

- [x] Analiza postojećeg sistema lokalizacije
- [x] Definisanje arhitekture za korisničke preferencije
- [x] Kreiranje okvirnog plana implementacije
- [x] Korak 1: Baza podataka (JSONB sa direktnim jsonb_matches_schema)
- [x] Korak 2: LocaleManager klasa sa $state runes i Supabase integracijom
- [x] Korak 3: UserPreferencesService sa ispravkama za Supabase Json tipove
- [x] Korak 4: ~~API endpoint~~ (eliminisan - koristi se direktan Supabase)
- [x] Korak 5: Layout server ažuriranje (implementirano)
- [x] Korak 6: Client-side inicijalizacija store-a (context pattern)
- [x] Korak 7: UI komponenta za izbor (napredna sa preview-om)
- [ ] Korak 8: Smart CRUD integracija
- [ ] Korak 9: Testiranje i optimizacija

## Napomene

- **Koraci 1-5 su završeni** - kompletna server-side infrastruktura je implementirana
- **TypeScript greške su rešene** - proper Json type handling sa helper funkcijama
- LocaleManager koristi isti pristup kao EnhancedFormStateManager (Svelte 5 runes, class-based)
- Direktan Supabase pristup omogućava RLS podršku i real-time mogućnosti
- Layout server sada učitava i prosleđuje sve potrebne locale podatke
- Plan je kreiran za postupnu implementaciju gde se svaki korak analizira i koriguje
- JSONB pristup omogućava lako dodavanje novih preferencija u budućnosti
- Konzistentnost sa postojećim pristupom u aplikaciji