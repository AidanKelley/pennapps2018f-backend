const express = require("express"), {getEpoch} = require("./util");

module.exports = (client) => {
    let router = express.Router();

    router.post("/take/:id", (req, res) => {
        if (req.token.role === "patient") {
            const id = req.params.id, time = getEpoch();
            client.update({
                TableName: "Medications",
                Key: {
                    id: id
                },
                UpdateExpression: "set #tries = :zero, #h = list_append(:time, (if_not_exists(#h, :emptyList)))",
                ExpressionAttributeNames: {
                    "#tries":"tries",
                    "#h":"takenHistory"
                },
                ExpressionAttributeValues: {
                    ":zero":0,
                    ":time": [time],
                    ":emptyList": []
                }
            }).promise().then(data => {
                res.status(200).json({ok: 1});
            }).catch(err => {
                res.status(400).json({
                    err: {
                        code: "id"
                    }
                });
            });

            client.update({
                TableName: "Users",
                Key: {
                    usernameLower: req.token.username.toLowerCase()
                },
                UpdateExpression: "set #h = list_append(:newItem, (if_not_exists(#h, :emptyList)))",
                ExpressionAttributeNames: {
                    "#h":"history",
                },
                ExpressionAttributeValues: {
                    ":newItem":[{action: "take", medicationId: id, time:time}],
                    ":emptyList":[]
                }
            }).promise().catch(console.log);
        }
        else {
            res.status(401).json({
                err: {
                    code: "unauthorized",
                    msg: "You must be a patient to do this"
                }
            });
        }
    });

    router.post("/reject/:id", (req, res) => {
        if (req.token.role === "patient") {
            const id = req.params.id, time = getEpoch();
            client.update({
                TableName: "Medications",
                Key: {
                    id: id
                },
                UpdateExpression: "set #tries = if_not_exists(#tries, :zero) + :one",
                ExpressionAttributeNames: {
                    "#tries":"tries"
                },
                ExpressionAttributeValues: {
                    ":zero": 0,
                    ":one": 1
                }
            }).promise().then(data => {
                res.status(200).json({ok: 1});
            }).catch(err => {
                res.status(400).json({
                    err: {
                        code: "id"
                    }
                });
            });

            client.update({
                TableName: "Users",
                Key: {
                    usernameLower: req.token.username.toLowerCase()
                },
                UpdateExpression: "set #h = list_append(:newItem, (if_not_exists(#h, :emptyList)))",
                ExpressionAttributeNames: {
                    "#h":"history",
                },
                ExpressionAttributeValues: {
                    ":newItem":[{action: "reject", medicationId: id, time:time}],
                    ":emptyList":[]
                }
            }).promise().catch(console.log);
        }
        else {
            res.status(401).json({
                err: {
                    code: "unauthorized",
                    msg: "You must be a patient to do this"
                }
            });
        }
    });

    return router;
};