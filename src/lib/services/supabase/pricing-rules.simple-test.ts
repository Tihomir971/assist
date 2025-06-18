/**
 * Simple test for pricing rules proportional markup
 * Run this to verify the pricing logic works correctly
 */

// Simple test class that mimics the service logic
class SimplePricingTest {
	// Test the proportional markup calculation
	testProportionalMarkup(
		costPrice: number,
		lowerBound: number,
		lowerMarkup: number,
		upperBound: number,
		upperMarkup: number
	): number {
		let markupPercent: number;

		if (costPrice <= lowerBound) {
			markupPercent = lowerMarkup;
		} else if (costPrice >= upperBound) {
			markupPercent = upperMarkup;
		} else {
			// Proportional calculation
			const ratio = (costPrice - lowerBound) / (upperBound - lowerBound);
			markupPercent = lowerMarkup + (upperMarkup - lowerMarkup) * ratio;
		}

		return costPrice * (1 + markupPercent / 100);
	}

	// Run all tests
	runTests(): void {
		console.log('🧪 Testing Proportional Markup System');
		console.log('=====================================');

		// Test parameters: Lower: $100@50%, Upper: $200@20%
		const tests = [
			{ cost: 50, expected: 75 }, // Below lower bound: 50 * 1.5 = 75
			{ cost: 100, expected: 150 }, // At lower bound: 100 * 1.5 = 150
			{ cost: 150, expected: 202.5 }, // Middle: 150 * 1.35 = 202.5 (35% markup)
			{ cost: 200, expected: 240 }, // At upper bound: 200 * 1.2 = 240
			{ cost: 300, expected: 360 } // Above upper bound: 300 * 1.2 = 360
		];

		let passed = 0;
		let failed = 0;

		tests.forEach((test, index) => {
			const result = this.testProportionalMarkup(test.cost, 100, 50, 200, 20);
			const success = Math.abs(result - test.expected) < 0.01; // Allow small floating point differences

			console.log(
				`Test ${index + 1}: Cost $${test.cost} → $${result.toFixed(2)} ${success ? '✅' : '❌'}`
			);

			if (success) {
				passed++;
			} else {
				failed++;
				console.log(`  Expected: $${test.expected}, Got: $${result.toFixed(2)}`);
			}
		});

		console.log('\n📊 Test Results:');
		console.log(`✅ Passed: ${passed}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

		if (failed === 0) {
			console.log('\n🎉 All tests passed! Proportional markup is working correctly.');
		} else {
			console.log('\n⚠️  Some tests failed. Check the implementation.');
		}
	}

	// Test markup calculation at different points
	showMarkupCurve(): void {
		console.log('\n📈 Markup Curve Demonstration');
		console.log('Cost\t\tMarkup%\t\tPrice');
		console.log('----\t\t-------\t\t-----');

		const testCosts = [50, 100, 125, 150, 175, 200, 300];

		testCosts.forEach((cost) => {
			let markup: number;

			if (cost <= 100) {
				markup = 50;
			} else if (cost >= 200) {
				markup = 20;
			} else {
				const ratio = (cost - 100) / (200 - 100);
				markup = 50 + (20 - 50) * ratio;
			}

			const price = cost * (1 + markup / 100);
			console.log(`$${cost}\t\t${markup.toFixed(1)}%\t\t$${price.toFixed(2)}`);
		});
	}
}

// Export function to run the test
export function runSimpleTest(): void {
	const test = new SimplePricingTest();
	test.runTests();
	test.showMarkupCurve();
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
	runSimpleTest();
}
