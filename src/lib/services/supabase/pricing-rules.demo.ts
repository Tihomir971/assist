/**
 * Demo fajl koji pokazuje kako se koristi sistem cenovnih formula
 * Ovaj fajl možeš pokrenuti da vidiš kako funkcioniše sistem
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { PricingRulesService } from './pricing-rules.service';
import type { PricingRuleCreate, PricingContext } from '$lib/types/pricing-rules.types';

// Simulacija Supabase klijenta za demo
const mockSupabase = {} as SupabaseClient;

// Pomoćna funkcija za računanje proporcionalne marže
function calculateProportionalMarkup(
	costPrice: number,
	lowerBound: number,
	lowerMarkup: number,
	upperBound: number,
	upperMarkup: number,
	minPrice?: number
): number {
	let markupPercent: number;

	if (costPrice <= lowerBound) {
		markupPercent = lowerMarkup;
	} else if (costPrice >= upperBound) {
		markupPercent = upperMarkup;
	} else {
		const ratio = (costPrice - lowerBound) / (upperBound - lowerBound);
		markupPercent = lowerMarkup + (upperMarkup - lowerMarkup) * ratio;
	}

	const calculatedPrice = costPrice * (1 + markupPercent / 100);
	return minPrice ? Math.max(calculatedPrice, minPrice) : calculatedPrice;
}

export async function demoKoriscenjeCenovnihFormula() {
	console.log('🎯 DEMO: Korišćenje cenovnih formula\n');

	const service = new PricingRulesService(mockSupabase);

	// ========================================
	// 1. KREIRANJE OSNOVNIH PRAVILA
	// ========================================

	console.log('📝 1. Kreiranje osnovnih cenovnih pravila...\n');

	// Pravilo 1: Samsung TV-ovi sa proporcionalnom marže
	const samsungTVRule: PricingRuleCreate = {
		name: 'Samsung TV proporcionalna cena',
		conditions: {
			category_ids: [1], // TV kategorija
			attributes: [
				{
					attribute_id: 5, // Brend atribut
					type: 'options',
					option_ids: [25] // Samsung opcija
				},
				{
					attribute_id: 7, // Dijagonala atribut
					type: 'options',
					option_ids: [50, 55, 65, 75] // 50", 55", 65", 75"
				}
			]
		},
		formula: {
			type: 'proportional_markup',
			lower_bound: 400, // $400 donja granica
			lower_markup: 70, // 70% marža na donjoj granici
			upper_bound: 2000, // $2000 gornja granica
			upper_markup: 20, // 20% marža na gornjoj granici
			min_price: 599.99 // Minimalna cena
		},
		priority: 1,
		is_active: true
	};

	// Pravilo 2: Veleprodajni popust
	const veleprodajniPopust: PricingRuleCreate = {
		name: 'Veleprodajni popust 15%',
		conditions: {
			min_quantity: 10 // Minimum 10 komada
		},
		formula: {
			type: 'discount',
			discount_percent: 15 // 15% popust
		},
		target_group: 'wholesale',
		priority: 2,
		is_active: true
	};

	// Pravilo 3: Sezonska akcija
	const sezonska: PricingRuleCreate = {
		name: 'Letnja akcija - TV aparati',
		conditions: {
			category_ids: [1, 2] // TV i Audio kategorije
		},
		formula: {
			type: 'discount',
			discount_percent: 25 // 25% popust
		},
		starts_at: '2024-06-01T00:00:00Z',
		ends_at: '2024-08-31T23:59:59Z',
		priority: 1,
		is_active: true
	};

	console.log('✅ Kreirana 3 osnovna pravila:');
	console.log(`   • ${samsungTVRule.name}`);
	console.log(`   • ${veleprodajniPopust.name}`);
	console.log(`   • ${sezonska.name}\n`);

	// ========================================
	// 2. TESTIRANJE RAZLIČITIH SCENARIJA
	// ========================================

	console.log('🧪 2. Testiranje različitih scenarija...\n');

	// Scenario 1: Samsung TV 55" - nabavka $800
	const scenario1: PricingContext = {
		product_id: 123,
		cost_price: 800,
		retail_price: 1200,
		quantity: 1,
		partner_id: 456
	};

	console.log('📱 Scenario 1: Samsung TV 55" (nabavka $800)');
	await testScenario(scenario1);

	// Scenario 2: Samsung TV 75" - nabavka $2500 (preko gornje granice)
	const scenario2: PricingContext = {
		product_id: 124,
		cost_price: 2500,
		retail_price: 3500,
		quantity: 1,
		partner_id: 456
	};

	console.log('📺 Scenario 2: Samsung TV 75" (nabavka $2500)');
	await testScenario(scenario2);

	// Scenario 3: Veleprodaja - 15 komada
	const scenario3: PricingContext = {
		product_id: 125,
		cost_price: 600,
		retail_price: 900,
		quantity: 15, // Veleprodaja!
		partner_id: 789
	};

	console.log('📦 Scenario 3: Veleprodaja 15 komada Samsung TV 50"');
	await testScenario(scenario3);

	// Scenario 4: Jeftini Samsung TV - ispod donje granice
	const scenario4: PricingContext = {
		product_id: 126,
		cost_price: 300, // Ispod $400 donje granice
		retail_price: 500,
		quantity: 1,
		partner_id: 456
	};

	console.log('💰 Scenario 4: Jeftini Samsung TV (nabavka $300)');
	await testScenario(scenario4);

	// ========================================
	// 3. DEMONSTRACIJA PROPORCIONALNE MARŽE
	// ========================================

	console.log('\n📊 3. Demonstracija proporcionalne marže...\n');

	const testCosts = [300, 400, 600, 800, 1000, 1500, 2000, 2500];

	console.log('Nabavka → Prodaja (Marža %)');
	console.log('─'.repeat(35));

	for (const cost of testCosts) {
		const price = calculateProportionalMarkup(cost, 400, 70, 2000, 20, 599.99);
		const markup = (((price - cost) / cost) * 100).toFixed(1);

		console.log(
			`$${cost.toString().padStart(4)} → $${price.toFixed(2).padStart(7)} (${markup.padStart(4)}%)`
		);
	}

	// ========================================
	// 4. KREIRANJE SLOŽENIJIH PRAVILA
	// ========================================

	console.log('\n🔧 4. Kreiranje složenijih pravila...\n');

	// Pravilo za premium brendove
	const premiumRule: PricingRuleCreate = {
		name: 'Premium brendovi - fiksna marža',
		conditions: {
			category_ids: [1],
			attributes: [
				{
					attribute_id: 5, // Brend
					type: 'options',
					option_ids: [25, 26, 27] // Samsung, LG, Sony
				},
				{
					attribute_id: 8, // Cenovni rang
					type: 'options',
					option_ids: [100] // Premium
				}
			]
		},
		formula: {
			type: 'markup_cost',
			value: 1.4, // 40% marža
			min_price: 999.99
		},
		priority: 1,
		is_active: true
	};

	// Pravilo za određeni cenovni opseg
	const cenovniOpsegRule: PricingRuleCreate = {
		name: 'Srednji cenovni opseg',
		conditions: {
			attributes: [
				{
					attribute_id: 9, // Cena atribut
					type: 'number',
					min_value: 500, // Između $500
					max_value: 1500 // i $1500
				}
			]
		},
		formula: {
			type: 'percentage_markup',
			value: 35 // 35% marža
		},
		priority: 3,
		is_active: true
	};

	console.log('✅ Kreirana složenija pravila:');
	console.log(`   • ${premiumRule.name}`);
	console.log(`   • ${cenovniOpsegRule.name}\n`);

	// ========================================
	// 5. SAVETI ZA KORIŠĆENJE
	// ========================================

	console.log('💡 5. Saveti za korišćenje:\n');

	console.log('🎯 Prioriteti:');
	console.log('   1 = Najviši prioritet (specifična pravila)');
	console.log('   2-5 = Srednji prioritet (kategorijska pravila)');
	console.log('   6+ = Najniži prioritet (opšta pravila)\n');

	console.log('📋 Redosled kreiranja pravila:');
	console.log('   1. Specifična pravila (proizvod + atributi)');
	console.log('   2. Kategorijska pravila');
	console.log('   3. Opšta pravila (količina, partneri)\n');

	console.log('⚠️  Važne napomene:');
	console.log('   • Uvek postavi min_price za zaštitu');
	console.log('   • Testiraj pravila pre aktiviranja');
	console.log('   • Koristi jasne nazive');
	console.log('   • Dokumentuj složena pravila\n');

	console.log('🎉 Demo završen! Sistem je spreman za korišćenje.');
}

async function testScenario(context: PricingContext) {
	try {
		// Simulacija računanja cene (bez stvarne baze)
		const mockPrice = calculateProportionalMarkup(
			context.cost_price || 0,
			400,
			70,
			2000,
			20,
			599.99
		);

		console.log(`   Nabavka: $${context.cost_price}`);
		console.log(`   Količina: ${context.quantity}`);
		console.log(`   Prodajna cena: $${mockPrice.toFixed(2)}`);
		console.log(
			`   Marža: ${(((mockPrice - (context.cost_price || 0)) / (context.cost_price || 1)) * 100).toFixed(1)}%\n`
		);
	} catch (error) {
		console.log(`   ❌ Greška: ${error}\n`);
	}
}

// Eksportuj funkciju za pokretanje
export { demoKoriscenjeCenovnihFormula as runDemo };

// Za direktno pokretanje u Node.js
if (typeof window === 'undefined') {
	demoKoriscenjeCenovnihFormula().catch(console.error);
}
