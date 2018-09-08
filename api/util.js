function generateId(length) {
    let out = "";
    const possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for(let i = 0; i < length; i++) {
        out += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return out;
}

module.exports = {
    generateId
};