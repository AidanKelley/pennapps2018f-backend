const express = require("express");



module.exports = (client) => {
    let api = express.Router();



    let loginRouter = require("./login")(client);

    // console.log(loginRouter);
    api.use(loginRouter);
    api.use(require("./auth"));
    api.use(require("./medication")(client));
    console.log(api);

    return api;
};