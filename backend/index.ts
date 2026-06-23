import express from "express";
import { prisma } from "./db";
import { sign } from "jsonwebtoken" 
import { hash, compare } from "bcryptjs"
import { JWT_SECRET } from "./config";
import { auth } from "./auth";

const app = express();
const port = 4000;

app.use(express.json());

app.post("/signup", async (req, res) => {
  // input validation (username, password)
  const { username, password } = req.body;
  
  // checking if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { username }
  });

  // if yes (error)
  if (existingUser) {
    res.status(403).json({ message: `user already exists with username ${username}`})
    return;
  }

  // hash password
  const hashedPassword = await hash(password, 4);
  
  // create the user in the db
  await prisma.user.create({
    data: { username, password: hashedPassword }
  })
  
  // ask them to signin now
  res.status(201).json({ message: "signup successfull"})
});

app.post("/signin", async (req, res) => {
  // input validation (username, password)
  const { username, password } = req.body;

  // checking if user exists or not
  const existingUser = await prisma.user.findFirst({
    where: { username }
  });

  // if not (error)
  if (!existingUser) {
    res.status(403).json({ message: `user not found with username ${username}`})
    return;
  }
  
  // compare password
  const isPasswordValid = await compare(password, existingUser.password);
  
  // if not error
  if (!isPasswordValid) {
    res.status(403).json({ message: "invalid password" })
    return;
  }
  
  // else generate token
  const token = sign({ userId: existingUser.id }, JWT_SECRET);
  return res.json({ message: "signup successfull", token })
});

app.post("/project", auth, async (req, res) => {
  // input validation (title, initialPrompt, userId)
  const userId = req.userId;
  const { title, initialPrompt } = req.body;
  
  // creates project in the db
  const project = await prisma.project.create({
    data: { title, initialPrompt, userId }
  })

  // redirect the user to the particular project page
  // hit the /project/conversation/:projectId (from client )
  res.status(201).json({ message: "project created", projectId: project.id })
});

app.post("/project/conversation/:projectId", auth, (req, res) => {
  // create conversation in the db
  // runs the agent loop
  // returning the updated files
});

app.get("/project/:projectId", auth, (req, res) => {
  // get the project details
  // like project details
  // conversation
  // tool calls
  // recreating files (using tool calls)
});

app.get("/projects", auth, async (req, res) => {
  const userId = req.userId;
  
  // returning the array of projects (user based)
  const projects = await prisma.project.findMany({
    where: { userId }
  });

  res.json({ projects })
});

app.listen(port, () => console.log("code is running at", port));
