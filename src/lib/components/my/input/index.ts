// import MyCurrencyInput from './currency-input.svelte';
import CurrencyInput from './input-currency.svelte';
import DateInput from './input-date.svelte';
import FileInput from './input-file.svelte';
import NumberInputZag from './input-number-zag.svelte';
import TextInput from './input-text.svelte';
import UrlInput from './input-url.svelte';
// Old Zag-based combobox (kept for reference)
import ComboboxZag from './combobox-zag.svelte';
import ComboboxMelt from './combobox-melt.svelte';
// New Bits-UI based combobox (default)
import ComboboxInputBits from './input-combobox-bits.svelte';
import ComboboxShad from './input-combobox-shad.svelte';

export {
	CurrencyInput as MyCurrencyInput,
	DateInput as MyDateInput,
	FileInput as MyFileInput,
	TextInput as MyTextInput,
	ComboboxInputBits as ComboboxBits,
	ComboboxZag as ComboboxZag,
	ComboboxMelt as ComboboxMelt,
	ComboboxShad as ComboboxShad,
	UrlInput as MyUrlInput,
	NumberInputZag as NumberInputZag
};
