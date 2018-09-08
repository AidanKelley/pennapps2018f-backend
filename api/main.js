const express = require("express");



module.exports = (client) => {
    let api = express.Router();



    let loginRouter = require("./login")(client);

    // console.log(loginRouter);
    api.use(loginRouter);
    api.use(require("./auth"));
    api.use(require("./medication")(client));
    api.use(require("./take")(client));
    api.use(require("./authProvider")(client));
    console.log(api);

    return api;
};