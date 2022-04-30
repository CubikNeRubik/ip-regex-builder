import {IP_REGEX, IP_REGEX_STRICT, WILDCARD_REGEX, WILDCARD_REGEX_STRICT} from "./constants";

// TODO: need some refactoring

// private static
const ipRegex = new RegExp(IP_REGEX);
const ipRegexStrict = new RegExp(IP_REGEX_STRICT);
const wildcardRegex = new RegExp(WILDCARD_REGEX);
const wildcardRegexStrict = new RegExp(WILDCARD_REGEX_STRICT);

/**
 *
 * @param ip        {string}  - ip for validation
 * @param option?   {number}  - type of validation (0 (default) - ip only, 1 - wildcard ip, 2 - both)
 * @param isStrict? {boolean} - is strict validation
 * @returns {boolean}
 */
export function validateIPv4(ip, option = 0, isStrict = false){

    if(isStrict === true) {
        switch(option){
            case 0: return !!ipRegexStrict.test(ip);
            case 1: return !!wildcardRegexStrict.test(ip);
            case 2: return !!(ipRegexStrict.test(ip) || wildcardRegexStrict.test(ip));
        }
    } else {
        switch(option){
            case 0: return !!ipRegex.test(ip);
            case 1: return !!wildcardRegex.test(ip);
            case 2: return !!(ipRegex.test(ip) || wildcardRegex.test(ip));
        }
    }
}