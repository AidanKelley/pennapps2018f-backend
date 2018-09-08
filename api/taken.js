const express = require("express");

module.exports = (client) => {
    let router = express.Router();

    router.post("/taken/:id", (req, res) => {
        const id = req.params.id;

        client.update() {}
    });

    return router;
};