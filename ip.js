const regexBuilder = require('./util/regexBuilder');


let _startIP = new WeakMap();
let _endIP = new WeakMap();

let _isWildCard = new WeakMap();
let _isRange = new WeakMap();
let _regex = new WeakMap();

const BYTE_REGEXP = '([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])';
const IP_REGEX = `^(${BYTE_REGEXP}\\.){3}${BYTE_REGEXP}$`;

// Wildcards
const FIRST_ORDER_WILDCARD_REGEX    = `((${BYTE_REGEXP}\\.){0,3}(\\*))`;
const SECOND_ORDER_WILDCARD_REGEX   = `((${BYTE_REGEXP}\\.){2}(\\*)(\\.\\*)?)`;
const THIRD_ORDER_WILDCARD_REGEX    = `((${BYTE_REGEXP}\\.)(\\*)(\\.\\*\\.\\*)?)`;
const FULL_WILDCARD_REGEX           = `((\\*)(\\.\\*\\.\\*\\.\\*)?)`;
const WILDCARD_REGEX                = `^${FIRST_ORDER_WILDCARD_REGEX}|${SECOND_ORDER_WILDCARD_REGEX}|${THIRD_ORDER_WILDCARD_REGEX}|${FULL_WILDCARD_REGEX}$`;

const ipRegex = new RegExp(IP_REGEX);
const wildcardRegex = new RegExp(WILDCARD_REGEX);


module.exports = class IP {

    get value() {

        let result = _startIP.get(this);
        const endIP = _endIP.get(this);

        if(this.isRange && !this.isWildcard){
            result += ' - ' + endIP;
        }

        return result;
    }

    get regex() {
        return _regex.get(this);
    }

    get isRange() {
        return _isRange.get(this);
    }

    get isWildcard() {
        return _isWildCard.get(this);
    }

    constructor(startIP, endIP){

        if(startIP.indexOf("-") >= 0){
            const ips = startIP.split("-");
            startIP = ips[0].trim();
            endIP = ips[1].trim();
        }

        if(startIP && endIP){
            //validate for range
            if(!ipRegex.test(startIP)){
                throw new Error('Start IP of the range is not valid');
            }
            if(!ipRegex.test(endIP)){
                throw new Error('End IP of the range is not valid');
            }

            _isWildCard.set(this, false);
            _isRange.set(this, startIP !== endIP);

        } else if (startIP) {

            if(startIP.indexOf("*") < 0){

                //validate for single ip
                if(!ipRegex.test(startIP)){
                    throw new Error('IP is not valid');
                }

                _isWildCard.set(this, false);
                _isRange.set(this, false);
            }
            else {
                //validate for single ip
                if(!wildcardRegex.test(startIP)){
                    throw new Error('Wildcard is not valid');
                }

                _isWildCard.set(this, true);
                _isRange.set(this, true);
            }

        } else {
            //wrong params
            throw new Error('Wrong params');
        }

        _startIP.set(this, startIP);
        _endIP.set(this, endIP);

        //generate regex
        let regex = null;

        if(!this.isRange){
            regex = this.value;
        } else {

            if(this.isWildcard){
                regex = regexBuilder.IpWildcardRegex(_startIP.get(this))
            } else {
                regex = regexBuilder.IpRangeRegex(_startIP.get(this), _endIP.get(this))
            }
        }

        regex = new RegExp(`^${regex}$`);
        _regex.set(this, regex);
    }
};