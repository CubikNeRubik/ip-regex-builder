module.exports = {
    IpRangeRegex,
    IpWildcardRegex
};

const BYTE_REGEXP = '([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])';

function IpWildcardRegex(wildcardIP){

    const bytes = wildcardIP.split(".");
    let regex = '';

    for(let i = 0; i < 4; i++){
        if(bytes[i] !== '*'){

            if(i > 0){
                regex += '\\.';
            }
            regex += bytes[i];

        } else {

            if(i === 0){
                regex += `(${BYTE_REGEXP})`;
                i++;
            }
            regex += `(\\.${BYTE_REGEXP}){${4 - i}}`;
            break;
        }
    }

    return regex;
}

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
                // Example: 168.0.1 -> 170.255.1 = (168->170)\.(0.1->255.1)
                return "(" + NumberRangeRegEx(start[0],end[0]) + ")\\." + IpRangeRegex(minorStart, minorEnd);
            }

            if(start[1] !== "0" && end[1] !== "255"){
                if(Math.abs(start[0] - end[0]) === 1){
                    // Example: 168.4.1 -> 169.101.1 = 168.(4.1->255.255) + 169.(0.0->101.1)
                    RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
                    RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, minorEnd) + ")";
                    return RegEx;
                } else {
                    // Example: 168.4.1 -> 179.101.1 = 168.(4.1->255.255) + (169.0.0->178.255.255) + 179.(0.0->101.1)
                    RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
                    RegEx += "|(" + IpRangeRegex( (+start[0] + 1) + "." + minAddress, (+end[0] - 1) + "." + maxAddress) + ")";
                    RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, minorEnd) + ")";
                    return RegEx;
                }
            }

            if(start[1] !== "0"){
                // Example: 168.4.1 -> 179.255.1 = 168.(4.1->255.255) + (169.0.0->178.255.1)
                RegEx += "(" + start[0] + "\\." + IpRangeRegex(minorStart, maxAddress);
                RegEx += "|" + IpRangeRegex((+start[0] + 1) + "." + minAddress, endIP) + ")";
                return RegEx;
            }
            if(end[1] !== "255"){
                // Example: 168.0.1 -> 179.101.1 = 168.0.1->178.255.255) + 179.(0.0->101.1)
                RegEx += "(" + IpRangeRegex(startIP, (end[0] - 1) + "." + maxAddress);
                RegEx += "|" + end[0] + "\\." + IpRangeRegex(minAddress, minorEnd) + ")";
                return RegEx;
            }
        }
    }

};

function NumberRangeRegEx (a,b){

    if(a*1 > b*1){
        var temp;
        temp = a;
        a = b;
        b = temp;
    }

    if(a === b) return a;

    if(a.length === 3 && a.length === b.length){
        // if both 3 digits number
        if(a.charAt(0) === b.charAt(0)){
            // if first digit are same generate range for rest digits
            return a.charAt(0) + "(" + NumberRangeRegEx(a.slice(1, a.length), b.slice(1, b.length)) + ")";
        } else {
            // if first digit are not same split in to ranges
            // Example: 130->240 = 130->199 + 200->240 = 1(30->99)|200->240
            return a.charAt(0) + "(" + NumberRangeRegEx(a.slice(1, a.length), "99") + ")|" + NumberRangeRegEx((a.charAt(0) * 1 + 1).toString() + "00", b);
        }
    }

    if(b.length === 3){
        // if 'b' 3 digit number and 'a' < 100 spit to two ranges
        // a->b = a->99 + 100->b
        return NumberRangeRegEx(a, "99") + "|" + NumberRangeRegEx("100", b);
    }

    if(a.length === b.length && a.length === 2){
        /* if first digits are same seconds must be in range
         * Example: 23->27 = 2(3->7)
         *
         * if second digits is 0 and 9 first digits must be in range
         * Example: 20->89 = (2->8)(0->9)
         *
         * if second digit of first number is not 0 spit to two ranges
         * Example: 24->57 = 24->29 + 30->57
         *
         * if second digit of second number is not 0 spit to two ranges
         * Example: 20->57 = 20->49 + 50->57
         */
        if(a.charAt(0) === b.charAt(0))
            return a.charAt(0) + range(a.charAt(1), b.charAt(1));
        else if(a.charAt(1) === "0" && b.charAt(1) === "9")
            return range(a.charAt(0), b.charAt(0)) + range(a.charAt(1), b.charAt(1));
        else if(a.charAt(1) !== "0")
            return NumberRangeRegEx(a, a.charAt(0) + "9") + "|" + NumberRangeRegEx((a.charAt(0) * 1 + 1).toString() + "0", b);
        else if(b.charAt(1) !== "9")
            return NumberRangeRegEx(a, (b.charAt(0) * 1 - 1).toString() + "9") + "|" + NumberRangeRegEx(b.charAt(0) + "0", b);
    }

    if(a.length === 1) {
        if(b.length === 1){
            return range(a, b);
        } else {
            return range(a, "9") + "|" + NumberRangeRegEx("10", b);
        }
    }

};

function range(a, b){

    if(+a === 0 && +b === 9){
        return "\\d"
    }

    return "[" + a + "-" + b + "]";
};