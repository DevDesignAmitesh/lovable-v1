import express from "express";
import { prisma } from "./db";
import { sign } from "jsonwebtoken" 
import { hash, compare } from "bcryptjs"
import { JWT_SECRET, previewUrl } from "./config";
import { auth } from "./auth";
import { agentLoop } from "./agent-loop";
import { listProjectFiles } from "./projectfiles";

const app = express();
const port = 4000;

app.use(express.json());

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  
  const existingUser = await prisma.user.findFirst({
    where: { username }
  });

  if (existingUser) {
    res.status(403).json({ message: `user already exists with username ${username}`})
    return;
  }

  const hashedPassword = await hash(password, 4);
  
  await prisma.user.create({
    data: { username, password: hashedPassword }
  })
  
  res.status(201).json({ message: "signup successfull"})
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { username }
  });

  if (!existingUser) {
    res.status(403).json({ message: `user not found with username ${username}`})
    return;
  }
  
  const isPasswordValid = await compare(password, existingUser.password);
  
  if (!isPasswordValid) {
    res.status(403).json({ message: "invalid password" })
    return;
  }
  
  const token = sign({ userId: existingUser.id }, JWT_SECRET);
  return res.json({ message: "signup successfull", token })
});

app.post("/project", auth, async (req, res) => {
  const userId = req.userId;
  const { title, initialPrompt } = req.body;
  
  const project = await prisma.project.create({
    data: { title, initialPrompt, userId }
  });

  res.status(201).json({ 
    message: "project created", 
    projectId: project.id, 
    initialPrompt,
  });
});

app.get("/project/conversation/:projectId", auth, async (req, res) => {
  const { query } = req.query as { query: string };
  const { projectId } = req.params as { projectId: string };
  
  const prevProj = await prisma.project.findFirst({
    where: { id: projectId }
  });
  
  if (!prevProj) {
    res.status(400).json({ message: "project not found" });
    return;
  }
  
  console.log("running")
  
  agentLoop(res, query, projectId);
});

app.get("/project/:projectId", auth, async (req, res) => {
  const userId = req.userId;
  const { projectId } = req.params as { projectId: string };
  
  const project = await prisma.project.findFirst({
    where: { userId, id: projectId },
    include: { conversation: true }
  });

  if (!project) {
    res.status(400).json({ message: "project not found" })
    return;
  }
  
  const files = await listProjectFiles()
  
  res.json({ 
    files, 
    previewUrl, 
    coversation: project.conversation,
  })
});

app.get("/projects", auth, async (req, res) => {
  const userId = req.userId;
  
  const projects = await prisma.project.findMany({
    where: { userId }
  });

  res.json({ projects })
});

app.listen(port, () => console.log("code is running at", port));
