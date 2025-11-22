const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(fileUpload());
app.use(express.static("public"));

/*
==========================================================
📌 ROUTE 1: MATLAB Auto-Upload → /live-csv
==========================================================
*/
app.post("/live-csv", (req, res) => {
    if (!req.files || !req.files.csvfile) {
        return res.status(400).send("No CSV received from MATLAB");
    }

    const file = req.files.csvfile;

    file.mv(path.join(__dirname, "public", "latest.csv"), (err) => {
        if (err) return res.status(500).send(err);

        console.log("📥 MATLAB updated latest.csv");
        res.send({ status: "OK", msg: "MATLAB CSV updated" });
    });
});

/*
==========================================================
📌 ROUTE 2: Manual Upload (Dashboard HTML Form)
==========================================================
*/
app.post("/upload-csv", (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send("No file uploaded");
    }

    const file = req.files.file;

    file.mv(path.join(__dirname, "public", "latest.csv"), (err) => {
        if (err) return res.status(500).send(err);

        console.log("📤 Manual CSV upload saved");
        res.send({ message: "CSV uploaded manually" });
    });
});

/*
==========================================================
📌 ROUTE 3: Example JSON API (Fake realtime demo)
==========================================================
*/
app.get("/data.json", (req, res) => {
    const d = {
        RMS_X: Math.random() * 0.2,
        RMS_Y: Math.random() * 0.2,
        RMS_Z: Math.random() * 0.2
    };
    res.json(d);
});

/*
==========================================================
📌 Start Server (Render compatible)
==========================================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
