// DateHelper.ts
import {
	parseAbsoluteToLocal,
	today,
	getLocalTimeZone,
	ZonedDateTime,
	CalendarDate
} from '@internationalized/date';
import { DateFormatter } from '@internationalized/date';

export class DateHelper {
	private locale: string;
	private defaultFormatter: DateFormatter;

	constructor(locale: string = 'sr-Latn-RS') {
		this.locale = locale;
		this.defaultFormatter = new DateFormatter(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			// second: '2-digit',
			hour12: false,
			timeZone: 'Europe/Belgrade'
		});
	}

	/**
	 * Formats an ISO string, removing spaces within the date part but
	 * preserving the space between the date and time.
	 *
	 * @param isoString The ISO 8601 datetime string to format.
	 * @returns The formatted date string (e.g., "30.12.2022. 14:30:00"), or null if invalid.
	 */
	public format(isoString: string | null | undefined): string | null {
		if (!isoString) {
			return null;
		}

		try {
			const zonedDateTime: ZonedDateTime = parseAbsoluteToLocal(isoString);
			const formattedDate = this.defaultFormatter.format(zonedDateTime.toDate());

			const lastSpaceIndex = formattedDate.lastIndexOf(' ');

			// Check if the format is what we expect (contains a space for the time)
			if (lastSpaceIndex === -1) {
				return formattedDate; // No spaces to worry about
			}

			const datePart = formattedDate.substring(0, lastSpaceIndex);
			const timePart = formattedDate.substring(lastSpaceIndex + 1);

			// Remove all spaces from the date part only
			const condensedDatePart = datePart.replace(/ /g, '');

			// Re-assemble the string with one space before the time
			return `${condensedDatePart} ${timePart}`;
		} catch (error) {
			console.error(`Formatting failed for input "${isoString}":`, error);
			return null;
		}
	}

	/**
	 * Gets today's date (date part only) formatted for the instance's locale.
	 */
	public getTodayFormatted(): string {
		const localTimeZone = getLocalTimeZone();
		const todayDate: CalendarDate = today(localTimeZone);
		const dateFormatter = new DateFormatter(this.locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: localTimeZone
		});

		return dateFormatter.format(todayDate.toDate(localTimeZone));
	}

	/**
	 * Gets today's date and time formatted for the instance's locale.
	 */
	public formatDateTime(date: Date): string {
		return this.defaultFormatter.format(date);
	}
}
