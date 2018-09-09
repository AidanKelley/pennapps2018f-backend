const bcrypt = require("bcryptjs"),
    express = require("express"),
    jwt = require("jsonwebtoken"),
    config = require("../config");

module.exports = (req, res, next) => {

    if(req.hasOwnProperty("body") && req.body.hasOwnProperty("token")) {
        jwt.verify(req.body.token, config.secret, (err, decoded) => {
            if(err) {
                res.status(401).json({
                    err: {
                        code: "unauthorized"
                    }
                });
            }
            else {
                req.token = decoded;

                if(decoded.role === "provider" && req.body.hasOwnProperty("username")) {
                    if(decoded.hasOwnProperty("patients") && decoded.patients.indexOf(req.body.username.toLowerCase())) {
                        next();
                    }
                    else {
                        res.status(401).json({
                            err: {
                                code: "unauthorized",
                                msg: "Unauthorized to view records for that patient"
                            }
                        });
                    }
                }
                else {
                    next();
                }
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