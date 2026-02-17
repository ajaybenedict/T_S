import { CSVColumn } from "./models/s1/s1-csv.interface";

export class S1CommonHelper {
    /**
 * Converts an array of data objects into a CSV-formatted string.
 *
 * Column definitions control both the header labels and the value extraction
 * logic for each row. The function ensures CSV safety by escaping double
 * quotes, wrapping values, and handling null or undefined values gracefully.
 *
 * @template T Type of the data row.
 * @param rows List of data rows to convert into CSV format.
 * @param columns Column configuration containing headers and value extractors.
 * @param options Optional configuration object (e.g., custom delimiter).
 * @returns CSV-formatted string representing the provided data.
 */
    public static generateCsv<T>(
        rows: T[],
        columns: CSVColumn<T>[],
        options?: { delimiter?: string }
    ): string {
        const delimiter = options?.delimiter ?? ',';

        const escape = (value: unknown): string => {
            if (value === null) return '';
            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                typeof value === 'bigint'
            ) {
                const escaped = value.toString().replace(/"/g, '""');
                return `"${escaped}"`;
            }    
            // Explicitly reject objects, functions, symbols, etc.        
            return '';
        };

        const headerRow = columns.map(c => escape(c.header)).join(delimiter);

        const dataRows = rows.map(row =>
            columns
                .map(col => escape(col.value(row)))
                .join(delimiter)
        );

        return [headerRow, ...dataRows].join('\n');
    }

    /**
 * Initiates a client-side download of a CSV file in the browser.
 *
 * The method creates a Blob from the CSV content, generates a temporary
 * object URL, and programmatically triggers a download using an anchor
 * element. All temporary resources are cleaned up after execution.
 *
 * @param csvContent CSV-formatted string to be downloaded.
 * @param fileName Name of the CSV file including the `.csv` extension.
 */
    public static downloadCsv(
        csvContent: string,
        fileName: string
    ): void {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(url);
    }

    /**
 * Formats a date value into US locale date-time format.
 *
 * Accepts either an ISO date string or a Date object and converts it into
 * a human-readable US format (`MM/DD/YYYY, hh:mm:ss AM/PM`). Invalid,
 * null, or undefined inputs return an empty string.
 *
 * @param value Date value as a string or Date object.
 * @returns US-formatted date-time string or an empty string for invalid input.
 */
    public static formatDateUS(
        value: string | Date | null | undefined
    ): string {
        if (!value) return '';

        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        }).format(date);
    }

    /**
    * Safely parses a JSON string and returns the parsed object.
    *
    * - If the input is not a string, it is returned as-is.
    * - If JSON parsing fails, the original value is returned.
    *
    * @template T
    * @param value - The value to parse (typically a JSON string).
    * @returns Parsed JSON object if successful, otherwise the original value.
    */
    public static safeJsonParse(value: unknown): unknown {
        if (typeof value !== 'string') {
            return value;
        }

        try {
            return JSON.parse(value);
        } catch {
            return value; // fallback: keep original string
        }
    }

    /**
 * Safely parses a JSON string while preserving the expected domain type.
 *
 * This helper is intended for **service-layer normalization**, where API fields
 * may arrive either as a JSON string or as an already-parsed object.
 *
 * - If the value is **not a string**, it is returned as-is.
 * - If the value is a string and contains valid JSON, it is parsed and returned.
 * - If parsing fails, the original value is returned, preserving runtime safety.
 *
 * Unlike `safeJsonParse`, this method does **not** return `unknown`.
 * It is designed to **maintain model stability** after API normalization.
 *
 * @typeParam T - Expected object type after parsing
 * @param value - JSON string, object of type `T`, or `null`
 * @returns Parsed object of type `T`, original object, or `null`
 */
    static safeJsonParsePreserve<T>(value: T | string | null): T | null {
        if (typeof value !== 'string') {
            return value;
        }

        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

}