//constants
export const BYTE_REGEXP = '(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])';
export const IP_REGEX = `^(${BYTE_REGEXP}\\.){3}${BYTE_REGEXP}$`;

// Wildcards
export const FIRST_ORDER_WILDCARD_REGEX    = `((${BYTE_REGEXP}\\.){0,3}(\\*))`;
export const SECOND_ORDER_WILDCARD_REGEX   = `((${BYTE_REGEXP}\\.){2}(\\*)(\\.\\*)?)`;
export const THIRD_ORDER_WILDCARD_REGEX    = `((${BYTE_REGEXP}\\.)(\\*)(\\.\\*\\.\\*)?)`;
export const FULL_WILDCARD_REGEX           = `((\\*)(\\.\\*\\.\\*\\.\\*)?)`;
export const WILDCARD_REGEX                = `^${FIRST_ORDER_WILDCARD_REGEX}|${SECOND_ORDER_WILDCARD_REGEX}|${THIRD_ORDER_WILDCARD_REGEX}|${FULL_WILDCARD_REGEX}$`;