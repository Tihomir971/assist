# Dokumentacija: UI za Upravljanje Cenovnim Pravilima

Ovaj dokument opisuje arhitekturu i implementaciju korisničkog interfejsa (UI) za upravljanje cenovnim pravilima unutar aplikacije.

## Pregled Funkcionalnosti

UI omogućava korisnicima da:
- Pregledaju listu svih postojećih cenovnih pravila.
- Kreiraju nova cenovna pravila.
- Izmene postojeća cenovna pravila.
- Brišu cenovna pravila.

Sistem koristi dialog-flow za kreiranje novih pravila: korisnik prvo unosi samo ime pravila, nakon čega se pravilo kreira sa podrazumevanim vrednostima, a korisnik se preusmerava na stranicu za detaljnu izmenu.

## Struktura Fajlova

Ključni fajlovi za ovu funkcionalnost nalaze se unutar `src/routes/(app)/crm/pricing-rules/`:

- **`+page.svelte`**: Komponenta za prikaz liste svih cenovnih pravila. Sadrži tabelu, dugme za kreiranje novog pravila (koje otvara dialog) i akcije po redovima (izmena, kloniranje, brisanje).
- **`+page.server.ts`**: Server-side logika za stranicu liste. Sadrži:
    - `load` funkciju za učitavanje svih pravila.
    - `create` akciju za inicijalno kreiranje pravila (samo sa imenom).
    - `delete` akciju za brisanje pravila.
- **`[id]/+page.svelte`**: Komponenta za kreiranje (nakon inicijalnog koraka) i izmenu pojedinačnog cenovnog pravila. Sadrži formu sa svim poljima pravila.
- **`[id]/+page.server.ts`**: Server-side logika za stranicu izmene/kreiranja. Sadrži:
    - `load` funkciju za učitavanje podataka o pravilu koje se menja ili postavljanje podrazumevanih vrednosti za novo pravilo.
    - `upsert` akciju za čuvanje izmena ili kompletnog novog pravila.
    - `delete` akciju (iako se primarno koristi sa liste, može biti i ovde).
- **`columns.ts`**: Definicije kolona za tabelarni prikaz na listi pravila.
- **`pricing-rules.payload.ts`**: (Opciono korišćen) `SmartPayloadBuilder` za transformaciju podataka pre slanja na server. Trenutno se transformacije vrše direktno u `+page.server.ts` fajlovima.
- **`README.md`**: Ovaj dokument.

Povezani fajlovi van ovog direktorijuma:
- **`src/lib/services/supabase/pricing-rules.service.ts`**: Servisni sloj koji enkapsulira logiku za interakciju sa Supabase bazom podataka vezano za cenovna pravila.
- **`src/lib/types/supabase.zod.schemas.ts`**: Sadrži Zod šeme za validaciju, uključujući `pricingRulesInsertSchema`.
- **`src/lib/types/supabase.zod.schemas.d.ts`**: TypeScript tipovi generisani iz Zod šema.
- **`src/lib/types/pricing-rules.types.ts`**: Definicije osnovnih TypeScript interfejsa za cenovna pravila (npr. `PricingRule`, `PricingConditions`, `PricingFormula`).
- **`src/routes/(app)/crm/+layout.svelte`**: Layout za CRM sekciju, relevantan za scroll funkcionalnost.
- **`src/routes/(app)/+layout.svelte`**: Glavni layout aplikacije, takođe relevantan za scroll.

## Ključni Koncepti i Tehnologije

- **SvelteKit**: Okvir za razvoj aplikacije, uključujući rutiranje, server-side actions, i `load` funkcije.
- **Svelte 5 Runes**: Koriste se reaktivne primitve kao što su `$state`, `$effect`, i `$derived` za upravljanje stanjem unutar komponenti.
- **Shadcn-svelte**: Biblioteka UI komponenti (npr. `Table`, `Dialog`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `Switch`).
- **sveltekit-superforms**: Biblioteka za upravljanje formama, integrisana sa Zod-om za validaciju.
- **Zod**: Biblioteka za definisanje šema i validaciju podataka.
- **Dialog-based Creation Flow**:
    1. Korisnik na listi pravila klikne na dugme "Novo pravilo".
    2. Otvara se dialog koji traži samo unos imena pravila.
    3. Nakon potvrde, poziva se `create` akcija na `src/routes/(app)/crm/pricing-rules/+page.server.ts`.
    4. Ova akcija kreira novo pravilo u bazi sa unetim imenom i podrazumevanim vrednostima za ostala polja (npr. `formula: { type: 'markup_cost', value: 1.2 }`).
    5. Korisnik se preusmerava na stranicu za izmenu (`/crm/pricing-rules/[new_rule_id]`) gde može detaljno konfigurisati pravilo.
- **Stranica za Izmenu/Kreiranje (`[id]/+page.svelte`)**:
    - Koristi se ista stranica i forma za finalizaciju novog pravila i za izmenu postojećeg.
    - `isCreateMode` flag (prosleđen iz `load` funkcije) se koristi za prilagođavanje UI elemenata (npr. naslovi, tekst na dugmetu za čuvanje).
    - Polja `formula` i `conditions` su implementirana kao `Textarea` komponente gde se unosi JSON.
    - Za odabir tipa formule (`formula.type`) koristi se `Select` komponenta. Stanje ove komponente (`selectedFormulaTypeValue`) i JSON string u `Textarea` za formulu su sinhronizovani pomoću `$effect` i funkcije `updateFormulaType`.
- **Server-Side Logika (`+page.server.ts`)**:
    - **`load` funkcije**: Učitavaju potrebne podatke sa servera pre renderovanja stranice. Za `[id]` stranicu, učitava podatke o pravilu ili postavlja inicijalne vrednosti za `superValidate`.
    - **`actions`**: Rukuju POST zahtevima (npr. kreiranje, izmena, brisanje). Validacija se vrši pomoću `superValidate` i Zod šema.
- **Servisni Sloj**: `PricingRulesService` sadrži metode (`list`, `getById`, `create`, `update`, `delete`) koje komuniciraju sa bazom.
- **Layout i Scrolling**:
    - Glavni layout aplikacije (`src/routes/(app)/+layout.svelte`) koristi `overflow-hidden` na jednom od svojih div elemenata.
    - CRM layout (`src/routes/(app)/crm/+layout.svelte`) dodaje `flex-1 overflow-y-auto` da omogući scroll unutar CRM sekcije.
    - Stranice unutar CRM-a (kao što je `pricing-rules/[id]`) ne implementiraju sopstvene scroll kontejnere, već se oslanjaju na CRM layout.
- **JSON Polja**: `conditions` i `formula` su JSONB polja u bazi. Na formi se prikazuju kao stringovi u `Textarea` komponentama.
    - Prilikom učitavanja (`load` u `[id]/+page.server.ts`), ova polja se konvertuju u JSON stringove (`JSON.stringify`) pre slanja `superValidate`.
    - Prilikom čuvanja (`upsert` akcija u `[id]/+page.server.ts`), stringovi iz forme se parsiraju nazad u JSON objekte (`JSON.parse`) pre slanja servisnom sloju.

## Proces Izmene Podataka

1.  **Učitavanje Liste**:
    - `load` funkcija u `src/routes/(app)/crm/pricing-rules/+page.server.ts` poziva `PricingRulesService.list()` da dobije sva pravila.
    - `+page.svelte` renderuje tabelu.
2.  **Kreiranje (Dialog)**:
    - Korisnik unosi ime u dialog na `+page.svelte`.
    - Forma se submituje na `create` akciju u `+page.server.ts`.
    - `superValidate` validira ime.
    - `PricingRulesService.create()` se poziva sa imenom i default vrednostima.
    - Vraća se `ruleId` i sledi redirect na `/crm/pricing-rules/[ruleId]`.
3.  **Učitavanje Stranice za Izmenu/Finalizaciju**:
    - `load` funkcija u `src/routes/(app)/crm/pricing-rules/[id]/+page.server.ts`:
        - Ako je `params.id` validan ID, poziva `PricingRulesService.getById()`.
        - Ako `params.id` ne postoji ili je 'create' (što se više ne koristi direktno za inicijalno kreiranje), pripremaju se podrazumevane vrednosti.
        - Podaci (ili podrazumevane vrednosti) se konvertuju (JSON u string) i prosleđuju `superValidate` sa `pricingRulesInsertSchema`.
    - `[id]/+page.svelte` prima `formPricingRule` i renderuje formu.
4.  **Čuvanje Izmena/Novog Pravila**:
    - Korisnik popunjava/menja formu na `[id]/+page.svelte`.
    - Forma se submituje na `upsert` akciju u `[id]/+page.server.ts`.
    - `superValidate` validira podatke forme.
    - Stringovi za `formula` i `conditions` se parsiraju u JSON objekte.
    - Ako postoji `form.data.id` (što je trenutno ID iz URL-a, a ne iz forme direktno za `pricingRulesInsertSchema`), poziva se `PricingRulesService.update()`.
    - Inače, poziva se `PricingRulesService.create()` (za slučaj da se `upsert` koristi za kreiranje, što je sada pokriveno inicijalnim dialog-flowom).
    - Vraća se status operacije.
5.  **Brisanje**:
    - Korisnik klikne "Obriši" u dropdown meniju na listi.
    - Forma se submituje na `delete` akciju u `src/routes/(app)/crm/pricing-rules/+page.server.ts`.
    - `superValidate` validira ID.
    - `PricingRulesService.delete()` se poziva sa ID-jem pravila.
    - Stranica se osvežava.

## Potencijalna Poboljšanja i Razmatranja

- **Kompleksniji UI za JSON polja**: Umesto `Textarea`, mogla bi se koristiti specijalizovana komponenta za vizuelno kreiranje JSON struktura za `conditions` i `formula`. (Ovo je planirano kao sledeći korak).
- **Tipovi za Formulu i Uslove**: Trenutno se `formula` i `conditions` tretiraju kao `any` ili `Json` na nekim mestima nakon parsiranja. Precizniji tipovi bi poboljšali type safety.
- **Kloniranje**: Funkcionalnost kloniranja je naznačena ali nije implementirana.
- **Greške pri Parsiranju JSON-a**: Trenutno se greške pri parsiranju JSON-a u `$effect` blokovima tiho ignorišu ili se postavlja default vrednost. Možda bi trebalo prikazati grešku korisniku.

Ova dokumentacija treba da posluži kao osnova za razumevanje i dalje unapređenje UI za upravljanje cenovnim pravilima.