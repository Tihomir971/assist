// import MyCurrencyInput from './currency-input.svelte';
import CurrencyInput from './input-currency.svelte';
import DateInput from './input-date.svelte';
import FileInput from './input-file.svelte';
import NumberInput from './input-number.svelte';
import TextInput from './input-text.svelte';
import UrlInput from './input-url.svelte';
// Old Zag-based combobox (kept for reference)
import ComboboxZagInput from './input-combobox.svelte';
import ComboboxMeltInput from './input-combobox-melt.svelte';
// New Bits-UI based combobox (default)
import ComboboxInput from './input-combobox-bits.svelte';

export {
	CurrencyInput as MyCurrencyInput,
	DateInput as MyDateInput,
	FileInput as MyFileInput,
	NumberInput as MyNumberInput,
	TextInput as MyTextInput,
	ComboboxInput as MyCombobox,
	ComboboxZagInput as MyComboboxZag,
	ComboboxMeltInput as MyComboboxMelt,
	UrlInput as MyUrlInput
};
