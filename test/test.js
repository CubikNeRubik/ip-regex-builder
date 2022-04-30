const {IpRule: IP, validateIPv4}  = require('./min/ip.min.js');

// TODO: add jest tests here

try{
    let ip1 = new IP('192.168.1.1', '192.168.0.7');
    let ip2 = new IP('192.168.0.7', '192.168.1.1');
    console.log("ip1", ip1.regex);
    console.log("ip2", ip2.regex);
} catch (err) {
    console.log(1, err);
}

try{
    let ip = new IP('192.168.1.2', '192.168.1.2');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(1, err);
}

try{
    let ip = new IP('192.0.1.2', '198.179.1.2');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(1, err);
}

try{
    let ip = new IP('192.168.1.2', '198.255.1.2');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(1, err);
}

try{
    let ip = new IP('192.168.0.1');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(2, err);
}

try{
    let ip = new IP('192.168.0.*');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(3, err);
}

try{
    let ip = new IP('192.168.*.*');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(3, err);
}

try{
    let ip = new IP('192.168.*');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(3, err);
}

try{
    let ip = new IP('*');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(3, err);
}

try{
    let ip = new IP('192.168.0.1', '192.168.0.266');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(4, err);
}

try{
    let ip = new IP('192.168.0.266', '192.168.0.7');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(5, err);
}

try{
    let ip = new IP('192.168.0.266');
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(6, err);
}

try{
    let ip = new IP();
    console.log(ip.value);
    console.log(ip.regex);
} catch (err) {
    console.log(7, err);
}
