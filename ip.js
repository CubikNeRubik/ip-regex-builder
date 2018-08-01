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

        if(endIP){
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
            regex = new RegExp(`^${this.value}$`);
        } else {

            regex = '';
            const startIpBytes = _startIP.get(this).split('.');

            if(this.isWildcard){

                for(let i = 0; i < 4; i++){
                    if(startIpBytes[i] !== '*'){

                        if(i > 0){
                            regex += '\\.';
                        }
                        regex += startIpBytes[i];

                    } else {

                        if(i == 0){
                            regex += `(${BYTE_REGEXP})`;
                            i++;
                        }
                        regex += `(\\.${BYTE_REGEXP}){${4 - i}}`;
                        break;
                    }
                }
            } else {

                regex = IpRangeRegex(_startIP.get(this), _endIP.get(this))
            }

            regex = new RegExp(`^${regex}$`);
        }

        _regex.set(this, regex);
    }
};

function IpRangeRegex(startIP, endIP){

    let RegEx = "";

    let start = startIP.split(".");
    let end = endIP.split(".");

    let minAddress = "";
    let maxAddress = "";
    for(var j = 0; j < start.length - 1; j++){
        minAddress += "0.";
        maxAddress += "255.";
    }

    // slice last dot
    minAddress = minAddress.slice(0, minAddress.length - 1);
    maxAddress = maxAddress.slice(0, maxAddress.length - 1);


    //get address without first byte
    const minorStart = startIP.slice(startIP.indexOf(".") + 1, startIP.length);
    const minorEnd   = endIP.slice(endIP.indexOf(".") + 1, endIP.length);

    if(start.length === 1) {
        // if it is last bytes
        if(start[0] === end[0]){
            // and they are same return byte
            return start[0];
        } else {
            // and they are different generate RegEx for range
            return "(" + NumberRangeRegEx(start[0],end[0]) + ")";
        }
    } else {
        // if it is not last bytes generate in recursion
        if(start[0] === end[0]){
            // if first bytes same
            return start[0] + "\\." + IpRangeRegex(minorStart, minorEnd);
        } else {
            // if first bytes different
            if(start[1] === "0" && end[1] === "255"){
                return "(" + NumberRangeRegEx(start[0],end[0]) + ")\\." + IpRangeRegex(minorStart, minorEnd);
            }

            if(start[1] !== "0" && end[1] !== "255"){
                if(Math.abs(start[0] - end[0]) === 1){
                    RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
                    RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, minorEnd) + ")";
                    return RegEx;
                } else {
                    RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
                    RegEx += "|(" + IpRangeRegex( (+start[0] + 1) + "." + minAddress, (+end[0] - 1) + "." + maxAddress) + ")";
                    RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, minorEnd) + ")";
                    return RegEx;
                }
            }

            // if(start[1] !== "0"){
            //     RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
            //     RegEx += "|" + IpRangeRegex((+start[0] + 1) + "." + minAddress, end[0] + "." + maxAddress) + ")";
            //     return RegEx;
            // }
            // if(end[1] !== "255"){
            //     RegEx += "(" + IpRangeRegex(start[0] + "." + minAddress, (end[0] - 1) + "." + maxAddress);
            //     RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, maxAddress) + ")";
            //     return RegEx;
            // }
        }
    }

}

function NumberRangeRegEx(a,b){
    if(a*1 > b*1){
        var temp;
        temp = a;
        a = b;
        b = temp;
    }
    if(a == b) return a;
    else if(a.charAt(0) == b.charAt(0) && a.length == b.length && a.length == 3)
        return a.charAt(0) + "(" + NumberRangeRegEx(a.slice(1, a.length), b.slice(1, b.length)) + ")";
    else if(a.length == b.length && a.length == 3)
        return a.charAt(0) + "(" + NumberRangeRegEx(a.slice(1, a.length), "99") + ")|" + NumberRangeRegEx((a.charAt(0) * 1 + 1).toString() + "00", b);
    else if(b.length == 3)
        return NumberRangeRegEx(a, "99") + "|" + NumberRangeRegEx("100", b);
    else if(a.charAt(0) == b.charAt(0) && a.length == b.length && a.length == 2)
        return a.charAt(0) + range(a.charAt(1), b.charAt(1));
    else if(a.length == b.length && a.charAt(1) == "0" && b.charAt(1) == "9" && a.length == 2)
        return range(a.charAt(0), b.charAt(0)) + range(a.charAt(1), b.charAt(1));
    else if(a.length == b.length && a.charAt(1) != "0" && a.length == 2)
        return NumberRangeRegEx(a, a.charAt(0) + "9") + "|" + NumberRangeRegEx((a.charAt(0) * 1 + 1).toString() + "0", b);
    else if(a.length == b.length && b.charAt(1) != "9" && b.length == 2)
        return NumberRangeRegEx(a, (b.charAt(0) * 1 - 1).toString() + "9") + "|" + NumberRangeRegEx(b.charAt(0) + "0", b);
    else if(a.length == 1 && b.length==1)
        return range(a, b);
    else if(a.length == 1)
        return range(a, "9") + "|" + NumberRangeRegEx("10", b);
}

function range(a, b){
    return "[" + a + "-" + b + "]";
}