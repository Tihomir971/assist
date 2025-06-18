# Uputstvo za korišćenje cenovnih formula

Ovaj dokument objašnjava kako da koristiš sistem cenovnih formula u aplikaciji.

## 🎯 Šta su cenovne formule?

Cenovne formule su pravila koja automatski računaju cene proizvoda na osnovu različitih uslova kao što su:
- Kategorija proizvoda
- Atributi proizvoda (brend, veličina, boja)
- Količina narudžbe
- Tip kupca (maloprodaja, veleprodaja)

## 📋 Tipovi formula

### 1. Proporcionalna marža (`proportional_markup`)
**Najvažniji tip** - omogućava glatke prelaze između cena.

**Primer**: Samsung TV-ovi
- Donja granica: $400 sa 70% marže
- Gornja granica: $2000 sa 20% marže
- Između: proporcionalno računanje

```json
{
  "type": "proportional_markup",
  "lower_bound": 400,
  "lower_markup": 70,
  "upper_bound": 2000,
  "upper_markup": 20,
  "min_price": 599.99
}
```

**Kako radi**:
- Nabavna cena ≤ $400 → 70% marža
- Nabavna cena $400-$2000 → proporcionalno između 70% i 20%
- Nabavna cena ≥ $2000 → 20% marža

### 2. Fiksna marža (`markup_cost`)
Jednostavno množenje nabavne cene.

```json
{
  "type": "markup_cost",
  "value": 1.5
}
```
*Rezultat: nabavna_cena × 1.5*

### 3. Fiksna cena (`fixed_price`)
Uvek ista cena bez obzira na nabavnu cenu.

```json
{
  "type": "fixed_price",
  "value": 99.99
}
```

### 4. Popust (`discount`)
Popust od maloprodajne cene.

```json
{
  "type": "discount",
  "discount_percent": 15
}
```
*Rezultat: maloprodajna_cena × (1 - 15/100)*

### 5. Procenat marže (`percentage_markup`)
Dodaje procenat na osnovnu cenu.

```json
{
  "type": "percentage_markup",
  "value": 25
}
```
*Rezultat: osnovna_cena × (1 + 25/100)*

## 🎯 Uslovi za primenu formula

### Atributi proizvoda
```json
{
  "attributes": [
    {
      "attribute_id": 5,        // ID atributa (brend)
      "type": "options",        // tip: "options" ili "number"
      "option_ids": [25]        // Samsung (ID opcije)
    },
    {
      "attribute_id": 7,        // ID atributa (dijagonala)
      "type": "options",
      "option_ids": [50, 55, 65, 75]  // 50", 55", 65", 75"
    }
  ]
}
```

### Kategorije proizvoda
```json
{
  "category_ids": [1, 2, 3]    // ID-jevi kategorija
}
```

### Količina
```json
{
  "min_quantity": 10,          // minimum 10 komada
  "max_quantity": 100          // maksimum 100 komada
}
```

### Partneri
```json
{
  "partner_ids": [123, 456]    // specifični partneri
}
```

## 🛠️ Kako da napraviš novu formulu

### Korak 1: Otvori admin panel
Idi na `/catalog/category/[id]` i klikni na "Price Rules" karticu.

### Korak 2: Klikni "Dodaj novo pravilo"

### Korak 3: Popuni osnovne podatke
```
Naziv: "Samsung TV proporcionalna cena"
Prioritet: 1 (manji broj = veći prioritet)
Aktivno: ✓
```

### Korak 4: Definiši uslove
```
Kategorije: [TV kategorija]
Atributi: 
  - Brend = Samsung
  - Dijagonala = 50", 55", 65", 75"
```

### Korak 5: Definiši formulu
```
Tip: Proporcionalna marža
Donja granica: $400
Donja marža: 70%
Gornja granica: $2000
Gornja marža: 20%
Minimalna cena: $599.99
```

### Korak 6: Sačuvaj

## 📊 Primeri iz prakse

### Primer 1: Samsung TV-ovi
```json
{
  "name": "Samsung TV proporcionalna cena",
  "conditions": {
    "category_ids": [1],
    "attributes": [
      {
        "attribute_id": 5,
        "type": "options", 
        "option_ids": [25]
      }
    ]
  },
  "formula": {
    "type": "proportional_markup",
    "lower_bound": 400,
    "lower_markup": 70,
    "upper_bound": 2000,
    "upper_markup": 20,
    "min_price": 599.99
  },
  "priority": 1
}
```

**Rezultati**:
- Samsung TV nabavka $300 → prodajna $599.99 (min. cena)
- Samsung TV nabavka $400 → prodajna $680 (70% marža)
- Samsung TV nabavka $800 → prodajna $1200 (50% marža - proporcionalno)
- Samsung TV nabavka $2000 → prodajna $2400 (20% marža)

### Primer 2: Veleprodajni popust
```json
{
  "name": "Veleprodajni popust",
  "conditions": {
    "min_quantity": 10
  },
  "formula": {
    "type": "discount",
    "discount_percent": 15
  },
  "target_group": "wholesale",
  "priority": 2
}
```

### Primer 3: Sezonska akcija
```json
{
  "name": "Letnja akcija",
  "conditions": {
    "category_ids": [1, 2]
  },
  "formula": {
    "type": "discount",
    "discount_percent": 25
  },
  "starts_at": "2024-06-01T00:00:00Z",
  "ends_at": "2024-08-31T23:59:59Z",
  "priority": 1
}
```

## 🔧 Kako sistem bira formulu

1. **Prioritet**: Pravila sa manjim brojem imaju veći prioritet
2. **Uslovi**: Svi uslovi moraju biti ispunjeni
3. **Vreme**: Proverava se da li je pravilo aktivno u datom periodu
4. **Prvo poklapanje**: Koristi se prva formula koja se poklapa

## 🧪 Testiranje formula

### Korišćenje test funkcije
```typescript
import { runSimpleTest } from '$lib/services/supabase/pricing-rules.simple-test';

// Pokreni test
runSimpleTest();
```

### Ručno testiranje
```typescript
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';

const service = new PricingRulesService(supabase);

// Test kontekst
const context = {
  product_id: 123,
  quantity: 1,
  cost_price: 800,
  partner_id: 456
};

// Izračunaj cenu
const price = await service.calculatePrice(context);
console.log(`Cena: $${price}`);

// Detaljne informacije
const breakdown = await service.getPricingBreakdown(context);
console.log('Primenjeno pravilo:', breakdown.appliedRule?.name);
```

## ⚠️ Važne napomene

### Redosled prioriteta
```
1. Specifična pravila (proizvod + atributi)
2. Kategorijska pravila
3. Opšta pravila (količina, partner)
```

### Najbolje prakse
1. **Koristi jasne nazive** za pravila
2. **Postavi prioritete** pažljivo
3. **Testiraj** pre aktiviranja
4. **Koristi minimalne cene** za zaštitu
5. **Dokumentuj** složena pravila

### Česti problemi
- **Nema poklapanja**: Proveri uslove i atribute
- **Pogrešna cena**: Proveri prioritet i formulu
- **Spore performanse**: Proveri indekse u bazi

## 📞 Podrška

Ako imaš problema:
1. Proveri da li su svi uslovi ispunjeni
2. Koristi `getPricingBreakdown()` za debug
3. Proveri prioritete pravila
4. Kontaktiraj administratora

---

*Ovaj sistem omogućava fleksibilno upravljanje cenama sa automatskim računanjem na osnovu različitih uslova.*