const express = require("express"),
    {generateId} = require("./util");

module.exports = (client) => {
    let router = express.Router();

    router.post("/medication", (req, res) => {
        console.log("here");
        if(req.token) {// === "provider") { //todo
            if (req.hasOwnProperty("body") &&
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
                        username: req.token.username,
                        usernameLower: req.token.username.toLowerCase(),
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

                    console.log(item);

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
                            console.log(err);
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

    // router.get("/medication/:id")

    return router;
};