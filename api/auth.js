const bcrypt = require("bcrypt"),
    express = require("express"),
    jwt = require("jsonwebtoken"),
    config = require("../config");

module.exports = (req, res, next) => {
    console.log(req.body);

    if(req.hasOwnProperty("body") && req.body.hasOwnProperty("token")) {
        jwt.verify(req.body.token, config.secret, (err, decoded) => {
            if(err) {
                console.log("auth failed");
                console.log(err);
                console.log(decoded);
                res.status(401).json({
                    err: {
                        code: "unauthorized"
                    }
                });
            }
            else {
                req.token = decoded;
                console.log(decoded);

                if(decoded.role === "provider" && req.body.hasOwnProperty("username")) {
                    if(decoded.hasOwnProperty("patients") && patients.indexOf(req.body.username.toLowerCase())) {
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