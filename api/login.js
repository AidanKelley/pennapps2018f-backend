const express = require("express"),
    bcrypt = require("bcryptjs"),
    config = require("../config"),
    jwt = require("jsonwebtoken");

module.exports = (client) => {
    let router = express.Router();

    router.post("/login", (req, res) => {
        console.log(req.body);
        if(req.hasOwnProperty("body") && req.body.hasOwnProperty("username") && req.body.hasOwnProperty("password")) {
            const username = req.body.username, password = req.body.password;

            client.get({
                TableName: "Users",
                Key: {
                    usernameLower: username.toLowerCase()
                },
                ProjectionExpression: "passwordHash, #role, patients, username",
                ExpressionAttributeNames: {
                    "#role":"role"
                }
            }).promise().then(data => {
                if(data.hasOwnProperty("Item") && data.Item.hasOwnProperty("passwordHash")
                    && data.Item.hasOwnProperty("role")) {
                    bcrypt.compare(password, data.Item.passwordHash).then(match => {
                        if(match) {
                            let decoded = {
                                username,
                                role: data.Item.role
                            };

                            if(data.Item.role === "provider") {
                                if(data.Item.hasOwnProperty("patients")) {
                                    decoded.patients = data.Item.patients;
                                }
                                else {
                                    decoded.patients = [];
                                }
                            }

                            jwt.sign(decoded, config.secret, {expiresIn: 3600*24*365*2}, function(err, token) {
                                if(err) {
                                    res.status(401).json({
                                        err: {
                                            code: "login"
                                        }
                                    });
                                }
                                else {
                                    res.status(200).json({token, role: data.Item.role, username: data.Item.username});
                                }
                            });
                        }
                        else {
                            return Promise.reject();
                        }
                    }).catch(err => {
                        res.status(401).json({
                            err: {
                                code: "login"
                            }
                        });
                    });
                }
                else {
                    return Promise.reject();
                }
            }).catch(err => {
                res.status(401).json({
                    err: {
                        code: "login"
                    }
                });
            });
        }
        else {
            res.status(400).json({err: {code: "form"}});
        }
    });

    function checkUsername(username) {
        if(username.length >= 4 && username.length <= 32) {
            const special = "._-";

            for(let i = 0; i < username.length; i++) {
                let char = username.charAt(i);

                if(!(('a' <= char && char <= 'z') || ('A' <= char && char <= 'Z')
                    || ('0' <= char && char <= '9') || special.indexOf(char) >= 0)) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }

    router.post("/register", (req, res) => {
        if(req.hasOwnProperty("body") && req.body.hasOwnProperty("username") && req.body.hasOwnProperty("password") &&
            req.body.hasOwnProperty("role") && req.body.hasOwnProperty("name")) {
            const username = req.body.username,
                password = req.body.password,
                role = req.body.role,
                name = req.body.name;

            if(password.length >= 8 && password.length <= 4096 && checkUsername(username)) {
                bcrypt.hash(password, 10, (err, hash) => {
                    if(err) {
                        res.status(500).json({ok: 0});
                    }
                    else {

                        let item = {
                            usernameLower: username.toLowerCase(),
                            username: username,
                            role: role,
                            passwordHash: hash,
                            name: name,
                            history: []
                        };

                        if(role === "provider") {
                            item.patients = [];
                        }

                        client.put({
                            TableName: "Users",
                            Item: item,
                            ConditionExpression: "attribute_not_exists(usernameLower)"
                        }).promise().then(data => {
                            res.status(200).json({ok: 1});
                        }).catch(err => {
                            if (err.code === "ConditionalCheckFailedException") {
                                res.json({
                                    err: {
                                        code: "username",
                                        msg: "username taken"
                                    }
                                });
                            }
                            else {
                                res.status(500).json({err: {code: "unknown"}});
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json({err: {code: "form"}});
            }
        }
        else {
            res.status(400).json({err: {code: "form"}});
        }
    });

    return router;
};