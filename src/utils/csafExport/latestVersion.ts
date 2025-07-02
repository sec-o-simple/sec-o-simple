import { TRevisionHistoryEntry } from "@/routes/document-information/types/tRevisionHistoryEntry";
import { compareVersions } from "../version";

/**
 * Compares two Date objects and returns the difference in milliseconds.
 * Used for sorting dates in chronological order.
 * 
 * @param a - The first date to compare
 * @param z - The second date to compare
 * @returns A negative number if a is before z, positive if a is after z, or 0 if they are equal
 */
function compareZonedDateTimes(a: Date, z: Date): number {
    return a.getTime() - z.getTime()
}

/**
 * Retrieves the version number of the most recent revision from a revision history array.
 * 
 * The function sorts the revision history by date (most recent first) and then by version number
 * as a secondary sort criteria. It returns the version number of the first entry after sorting.
 * 
 * @param history - Array of revision history entries containing date and version information.
 *                  Each entry must have a `date` property (string) and a `number` property (string).
 * @returns The version number of the latest revision as a string
 * 
 * @throws {Error} Throws if the history array is empty.
 * 
 * @example
 * ```typescript
 * const history = [
 *   { date: '2024-01-01', number: '1.0.0' },
 *   { date: '2024-01-15', number: '1.1.0' },
 *   { date: '2024-01-10', number: '1.0.1' }
 * ];
 * const latest = retrieveLatestVersion(history); // Returns '1.1.0'
 * ```
 * 
 * @example
 * ```typescript
 * // When dates are the same, version comparison is used as secondary sort
 * const sameDate = [
 *   { date: '2024-01-01', number: '1.0.0' },
 *   { date: '2024-01-01', number: '1.1.0' }
 * ];
 * const latest = retrieveLatestVersion(sameDate); // Returns '1.1.0'
 * ```
 */
export function retrieveLatestVersion(history: TRevisionHistoryEntry[]): string {
    if (history.length === 0) {
        throw new Error("Revision history is empty, cannot retrieve latest version.");
    }

    const sorted = history.slice()
        .sort(
            (a, z) =>
                compareZonedDateTimes(
                    new Date(z.date),
                    new Date(a.date),
                ) || compareVersions(a.number, z.number)
        )[0].number

    return sorted
}