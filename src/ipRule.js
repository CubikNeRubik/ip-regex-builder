import * as regexBuilder from './util/regexBuilder';
import {IP_REGEX_STRICT, WILDCARD_REGEX_STRICT} from './constants';

// TODO: need some refactoring

// private
let _startIP = new WeakMap();
let _endIP = new WeakMap();

let _isWildCard = new WeakMap();
let _isRange = new WeakMap();
let _regex = new WeakMap();

// private static
const ipRegex = new RegExp(IP_REGEX_STRICT);
const wildcardRegex = new RegExp(WILDCARD_REGEX_STRICT);

export default class IpRule {

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

            const startBytes = startIP.split('.');
            const endBytes = endIP.split('.');

            for(let i = 0; i < 4; i++){
                if(+startBytes[i] < +endBytes[i]){
                    break;
                }

                if(+startBytes[i] > +endBytes[i]){
                    const temp = startIP;
                    startIP = endIP;
                    endIP = temp;
                    break;
                }
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