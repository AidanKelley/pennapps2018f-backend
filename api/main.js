const express = require("express");



module.exports = (client) => {
    let api = express.Router();



    let loginRouter = require("./login")(client);

    // console.log(loginRouter);
    api.use(loginRouter);
    api.use(require("./auth"));
    api.post("/auth", (req, res) => {
        res.status(200).json({ok: 1, username: req.token.username, role: req.token.role});
    });
    api.use(require("./medication")(client));
    api.use(require("./take")(client));
    api.use(require("./authProvider")(client));

    return api;
};