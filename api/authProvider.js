const express = require("express");

module.exports = (client) => {

    let router = express.Router();

    router.post("/auth-provider", (req, res) => {
        console.log(req.token);
        if(req.token.role === "patient") {
            if(req.hasOwnProperty("body") && req.body.hasOwnProperty("username")) {
                client.update({
                    TableName: "Users",
                    Key: {
                        usernameLower: req.body.username.toLowerCase()
                    },
                    ConditionExpression: "#role = :provider and #usernameLower = :u",
                    UpdateExpression: "set #patients = list_append(:patient, if_not_exists(#patients, :empty))",
                    ExpressionAttributeValues: {
                        ":provider": "provider",
                        ":patient": [req.token.username],
                        ":empty": [],
                        ":u": req.body.username.toLowerCase()
                    },
                    ExpressionAttributeNames: {
                        "#role": "role",
                        "#patients": "patients",
                        "#usernameLower": req.body.username.toLowerCase()
                    }
                }).promise().then(data => {
                    res.status(200).json({ok: 1});
                }).catch(err => {
                    if(err.code === "ConditionalCheckFailedException") { //if the provider isn't a doc
                        res.status(400).json({err: {code: "username", msg: "The provided username is not a care provider"}});
                    }
                    else {
                        res.status(500).json({err: {code: "server"}});
                    }
                });
            }
        }
        else {
            res.status(401).json({err: {code: "unauthorized"}})
        }
        //todo: allows the patient to authorize a provider
    });

    return router;
};