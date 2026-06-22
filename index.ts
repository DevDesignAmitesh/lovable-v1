import express from "express";

const app = express();
const port = 4000;

app.use(express.json());

app.post("/signup", (req, res) => {});

app.post("/signin", (req, res) => {});

app.post("/project", (req, res) => {});

app.post("/project/conversation/:projectId", (req, res) => {});

app.get("/project/:projectId", (req, res) => {});

app.get("/projects", (req, res) => {});

app.listen(port, () => console.log("code is running at", port))
