import {
	create,
	evaluateDependencies,
	smallerEqDependencies,
	addDependencies,
	subtractDependencies,
	multiplyDependencies,
	largerEqDependencies,
	divideDependencies,
	parseDependencies
} from 'mathjs/number';

const { evaluate } = create(
	{
		...evaluateDependencies,
		...addDependencies,
		...subtractDependencies,
		...multiplyDependencies,
		...divideDependencies,
		...parseDependencies,
		...smallerEqDependencies,
		...largerEqDependencies
	},
	{}
);

export class PriceCalculator {
	public calculate(formula: string, taxPercent: number, input_price: number): number {
		const variables = { input_price };

		try {
			const basePrice = evaluate(formula, variables);
			if (typeof basePrice !== 'number' || isNaN(basePrice)) {
				throw new Error('Rezultat nije broj');
			}

			const withTax = basePrice * (1 + taxPercent);
			return this.roundPrice(withTax);
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(`Greška u evaluaciji: ${err.message}`);
			}
			throw new Error('Došlo je do greške prilikom evaluacije.');
		}
	}
	public customCalculate(
		input_price: number,
		taxPercent: number,
		variables: {
			lowerBound: number;
			upperBound: number;
			lowerPercent: number;
			upperPercent: number;
			input_price?: number;
		}
	): number {
		variables.input_price = input_price;
		const formula =
			'input_price <= lowerBound ? input_price * (1 + upperPercent) : input_price >= upperBound ? input_price * (1 + lowerPercent) : input_price * (1 + lowerPercent + (input_price - upperBound) / (lowerBound - upperBound) * 0.1)';
		try {
			const basePrice = evaluate(formula, variables);
			if (typeof basePrice !== 'number' || isNaN(basePrice)) {
				throw new Error('Rezultat nije broj');
			}

			const withTax = basePrice * (1 + taxPercent);
			console.log('input_price', input_price);
			console.log('basePrice', basePrice);
			console.log('withTax', withTax);
			return this.roundPrice(withTax);
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(`Greška u evaluaciji: ${err.message}`);
			}
			throw new Error('Došlo je do greške prilikom evaluacije.');
		}
	}

	private roundPrice(price: number): number {
		if (price < 100) {
			return Math.ceil(price) - 0.01;
		} else if (price >= 100 && price <= 1000) {
			return Math.ceil(price / 50) * 50 - 1;
		} else if (price >= 1000 && price <= 10000) {
			return Math.ceil(price / 100) * 100 - 1;
		} else {
			return Math.ceil(price / 1000) * 1000 - 1;
		}
	}
}
