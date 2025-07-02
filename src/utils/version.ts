import semver from 'semver'

/**
 * Compares two version strings
 *
 * @param v1 - First version string to compare
 * @param v2 - Second version string to compare
 * @returns 1 if v2 is greater than or equal to v1, -1 if v2 is less than v1.
 * For non-semver strings, returns numeric difference between parsed integers.
 */
export const compareVersions = (v1: string, v2: string) => {
  if (semver.valid(v1) && semver.valid(v2)) {
    return semver.gte(v2, v1) ? 1 : -1
  } else {
    return parseInt(v2) - parseInt(v1)
  }
}

/**
 * Normalizes a version string by removing any content after '+'
 *
 * @param version - Version string to normalize
 * @returns Version string without build metadata
 */
export const normalizeVersion = (version: string) => version.split('+')[0]
