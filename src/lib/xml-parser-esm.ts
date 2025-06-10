// xml-parser.ts
import { XMLParser } from 'fast-xml-parser';

export interface Product {
	name: string;
	category: string;
	model: string;
	manufacturer: string;
	description: string;
	id: number;
	code: string;
	ean: string;
	rating: number;
	price: number;
	rpc?: string;
	currency: string;
	stock: number;
	images?: unknown;
	attributes?: Record<string, unknown>;
	energy_class_doc?: string;
	specification_doc?: string;
	declaration?: string;
}

export interface ParsedXmlResult {
	products: Product[];
	totalCount: number;
	parsedAt: string;
	source: string;
}

export interface XmlParserOptions {
	timeout?: number;
	userAgent?: string;
	headers?: Record<string, string>;
}

/**
 * Retrieves XML from URL and parses it to JSON using fast-xml-parser
 * @param url - The XML URL to fetch
 * @param options - Optional configuration
 * @returns Promise<ParsedXmlResult>
 */
export async function retrieveAndParseXml(
	url: string,
	options: XmlParserOptions = {}
): Promise<ParsedXmlResult> {
	const { timeout = 30000, userAgent = 'XML-Parser/1.0', headers = {} } = options;

	try {
		// Fetch XML data
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(url, {
			headers: {
				'User-Agent': userAgent,
				Accept: 'application/xml, text/xml, */*',
				...headers
			},
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
		}

		const xmlString = await response.text();

		if (!xmlString || xmlString.trim().length === 0) {
			throw new Error('Empty XML response');
		}

		// Parse XML to JSON
		const parsedData = parseXmlString(xmlString);

		return {
			...parsedData,
			source: url,
			parsedAt: new Date().toISOString()
		};
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error(`Request timeout after ${timeout}ms`);
			}
			throw new Error(`Failed to retrieve and parse XML: ${error.message}`);
		}
		throw new Error('Unknown error occurred while parsing XML');
	}
}

/**
 * Parses XML string to structured JSON
 * @param xmlString - The XML string to parse
 * @returns Object with parsed products
 */
export function parseXmlString(xmlString: string): Omit<ParsedXmlResult, 'source' | 'parsedAt'> {
	const parserOptions = {
		// Preserve attributes
		ignoreAttributes: false,

		// Parse attribute values (convert numbers, booleans)
		parseAttributeValue: true,

		// Parse tag values (convert numbers, booleans)
		// Set to false to prevent automatic conversion of values like "04259" to numbers.
		// Specific numeric conversions are handled by parseNumber().
		parseTagValue: false,

		// Only parse actual numbers, not strings that look like numbers
		parseTrueNumberOnly: true,

		// Handle CDATA sections
		cdataPropName: '__cdata', // String value for CDATA property name

		// Trim whitespace
		trimValues: true,

		// Convert tags to arrays if there are multiple with same name
		isArray: (tagName: string) => {
			return tagName === 'product';
		},

		// Transform tag names (optional - for consistent naming)
		transformTagName: (tagName: string) => tagName.toLowerCase(),

		// Process attributes
		attributeNamePrefix: '@_',

		// Handle text nodes
		textNodeName: '#text',

		// Stop parsing on error
		stopNodes: ['*.products.product.description'],

		// Custom processors for specific tags
		processEntities: true,

		// Handle empty tags
		allowBooleanAttributes: true
	};

	try {
		const parser = new XMLParser(parserOptions);
		const jsonData = parser.parse(xmlString);

		// Extract products from parsed data
		const productsData = jsonData.products?.product || [];
		const productsArray = Array.isArray(productsData) ? productsData : [productsData];

		// Transform and clean the data
		const products: Product[] = productsArray.map((item: Record<string, unknown>) => {
			return {
				name: cleanCdata(item.name) || '',
				category: cleanCdata(item.category) || '',
				model: cleanCdata(item.model) || '',
				manufacturer: cleanCdata(item.manufacturer) || '',
				description: cleanCdata(item.description) || '',
				id: parseNumber(item.id) || 0,
				code: cleanCdata(item.code) || '',
				ean: cleanCdata(item.ean) || '',
				rating: parseNumber(item.rating) || 0,
				price: parseNumber(item.price) || 0,
				rpc: (item.rpc as string) || undefined,
				currency: cleanCdata(item.currency) || '',
				stock: parseNumber(item.stock) || 0,
				images: item.images || undefined,
				attributes: (item.attributes as Record<string, unknown>) || undefined,
				energy_class_doc: (item.energy_class_doc as string) || undefined,
				specification_doc: (item.specification_doc as string) || undefined,
				declaration: (item.declaration as string) || undefined
			};
		});

		return {
			products,
			totalCount: products.length
		};
	} catch (error) {
		throw new Error(
			`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
		);
	}
}

/**
 * Clean CDATA content and handle various text formats
 */
function cleanCdata(value: unknown): string {
	if (value === null || value === undefined) return '';

	if (typeof value === 'string') {
		return value.trim();
	}

	if (typeof value === 'object' && value !== null) {
		if ('#text' in value) {
			const textObj = value as { '#text': string };
			return textObj['#text'].trim();
		}
		// Check for CDATA property as configured in parserOptions
		if ('__cdata' in value) {
			const cdataObj = value as { __cdata: string };
			return cdataObj.__cdata.trim();
		}
	}

	return String(value).trim();
}

/**
 * Parse numeric values safely
 */
function parseNumber(value: unknown): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const parsed = parseFloat(value);
		return isNaN(parsed) ? 0 : parsed;
	}
	return 0;
}

/**
 * Validate XML string before parsing
 */
export function validateXmlString(xmlString: string): boolean {
	try {
		// Basic XML validation
		if (!xmlString || xmlString.trim().length === 0) return false;

		// Check for basic XML structure
		const trimmed = xmlString.trim();
		if (!trimmed.startsWith('<') || !trimmed.endsWith('>')) return false;

		// Check for products root element
		if (!trimmed.includes('<products') && !trimmed.includes('<product')) return false;

		return true;
	} catch {
		return false;
	}
}

/**
 * Get XML parser statistics
 */
export function getParserStats(result: ParsedXmlResult) {
	const stats = {
		totalProducts: result.totalCount,
		hasImages: result.products.filter((p) => p.images).length,
		hasAttributes: result.products.filter((p) => p.attributes).length,
		hasDescription: result.products.filter((p) => p.description && p.description.length > 0).length,
		averagePrice: result.products.reduce((sum, p) => sum + p.price, 0) / result.totalCount,
		currencies: [...new Set(result.products.map((p) => p.currency))],
		manufacturers: [...new Set(result.products.map((p) => p.manufacturer))],
		categories: [...new Set(result.products.map((p) => p.category))]
	};

	return stats;
}

// Usage examples:

/*
// Basic usage
const result = await retrieveAndParseXml('https://api.v2.spektar.rs/storage//exports/xml/kalisi-doo-TMqQOwAxdOBR8VK6PSHtEecygpm1UASz.xml');
console.log(`Parsed ${result.totalCount} products`);

// With options
const resultWithOptions = await retrieveAndParseXml(
  'https://api.v2.spektar.rs/storage//exports/xml/kalisi-doo-TMqQOwAxdOBR8VK6PSHtEecygpm1UASz.xml',
  {
    timeout: 60000,
    userAgent: 'MyApp/1.0',
    headers: {
      'Authorization': 'Bearer token123'
    }
  }
);

// Parse existing XML string
const xmlString = '<products><product>...</product></products>';
const parsed = parseXmlString(xmlString);

// Get statistics
const stats = getParserStats(result);
console.log('Parser stats:', stats);

// Validate XML before parsing
if (validateXmlString(xmlString)) {
  const result = parseXmlString(xmlString);
}
*/
