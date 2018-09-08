function generateId(length) {
    let out = "";
    const possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for(let i = 0; i < length; i++) {
        out += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return out;
}

function limitProperties(obj, keys) {
    let out = {...obj};
    for(key of Object.keys(obj)) {
        if(keys.indexOf(key) < 0) {
            delete out[key];
        }
    }

    return out;
}

module.exports = {
    generateId,
    limitProperties
};