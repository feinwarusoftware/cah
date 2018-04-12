"use strict";

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    return res.render("index");
});

router.get("/:room", (req, res) => {
    return res.render("room", { session: req.params.user });
});

module.exports = router;
