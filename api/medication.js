const express = require("express"),
    {generateId} = require("./util");

module.exports = (client) => {
    let router = express.Router();

    router.post("/medication", (req, res) => {
        if(req.token.role === "provider") {
            if (req.hasOwnProperty("body") &&
                req.body.hasOwnProperty("username") &&
                req.body.hasOwnProperty("brandName") &&
                req.body.hasOwnProperty("genericName") &&
                req.body.hasOwnProperty("description") &&
                req.body.hasOwnProperty("instructions") &&
                req.body.hasOwnProperty("days") &&
                req.body.hasOwnProperty("startTimeH") &&
                req.body.hasOwnProperty("startTimeM") &&
                req.body.hasOwnProperty("endTimeH") &&
                req.body.hasOwnProperty("endTimeM")
            ) {

                let attempts = 0;
                function tryPut() {
                    let id = generateId(8);
                    const item = {
                        id: id,
                        username: req.body.username,
                        usernameLower: req.body.username.toLowerCase(),
                        brandName: req.body.brandName,
                        genericName: req.body.genericName,
                        description: req.body.description,
                        instructions: req.body.instructions,
                        days: req.body.days,
                        startTimeH: req.body.startTimeH,
                        startTimeM: req.body.startTimeM,
                        endTimeH: req.body.endTimeH,
                        endTimeM: req.body.endTimeM,
                        tries: 0,
                        takenHistory: []
                    };

                    client.put({
                        TableName: "Medications",
                        Item: item,
                        ConditionExpression: "attribute_not_exists(#id)",
                        ExpressionAttributeNames: {
                            "#id":"id"
                        }
                    }).promise().then(data => {
                        res.status(200).json({id, ok: 1});
                    }).catch(err => {
                        if(err.code === "ConditionalCheckFailedException" && attempts < 16) {
                            attempts++;
                            tryPut();
                        }
                        else {
                            res.status(500).json({err: {code: "unknown"}});
                        }
                    });
                }

                tryPut();
            }
            else {
                res.status(400).json({err: {code: "form"}});
            }
        }
        else {
            res.status(401).json({err: {code: "unauthorized"}});
        }
    });


    router.get("/medication", (req, res) => {
        if(req.hasOwnProperty("token") && req.token.hasOwnProperty("username")) {
            let username = "";

            if(req.token.role === "patient") {
                username = req.token.username;
            }
            else if(req.token.role === "provider") {
                if(req.hasOwnProperty("body") && req.body.hasOwnProperty("username")) {
                    username = req.body.username;
                }
                else {
                    res.status(400).json({
                        err: {
                            code: "form"
                        }
                    });
                    return;
                }
            }
            else {
                res.status(500).json({
                    err: {
                        code: "server"
                    }
                });
                return;
            }

            client.query({
                TableName: "Medications",
                IndexName: "usernameLowerIndex",
                KeyConditionExpression: "usernameLower = :l",
                ExpressionAttributeValues: {
                    ":l": username.toLowerCase()
                },
                Limit: 64,
                ProjectionExpression: "id, brandName, genericName, description, instructions, days," +
                    "startTimeH, startTimeM, endTimeH, endTimeM, tries, takenHistory"
            }).promise().then(data => {
                if(data.hasOwnProperty("Items") && data.Items.length > 0) {
                    let medications = [];

                    for(let item of data.Items) {
                        const medication = {
                            id: item.id,
                            brandName: item.brandName,
                            genericName: item.genericName,
                            description: item.description,
                            instructions: item.instructions,
                            days: item.days,
                            startTimeH: item.startTimeH,
                            startTimeM: item.startTimeM,
                            endTimeH: item.endTimeH,
                            endTimeM: item.endTimeM,
                            tries: item.tries,
                            takenHistory: item.takenHistory
                        };

                        medications.push(medication);
                    }

                    res.status(200).json({medications});
                }
                else {
                    res.status(200).json({
                        medications: []
                    });
                }
            }).catch(err => {

                res.status(500).json({
                    err: {
                        code: "server"
                    }
                });
            });
        }
        else {
            res.status(500).json({
                err: {
                    code: "server"
                }
            });
        }
    });

    // router.get("/medication/:id")

    return router;
};