const bcrypt = require("bcrypt"),
    express = require("express"),
    jwt = require("jsonwebtoken"),
    config = require("../config");

module.exports = (req, res, next) => {
    console.log(req.body);
    if(req.hasOwnProperty("body") && req.body.hasOwnProperty("token")) {
        jwt.verify(req.body.token, config.secret, (err, decoded) => {
            if(err) {
                console.log(err);
                res.status(401).json({
                    err: {
                        code: "unauthorized"
                    }
                });
            }
            else {
                req.token = decoded;
                console.log(decoded);
                next();
            }
        });
    }
    else {
        res.status(401).json({
            err: {
                code: "unauthorized"
            }
        });
    }
};