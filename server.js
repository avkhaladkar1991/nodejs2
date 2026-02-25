const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const Task = mongoose.model("Task", {
  name: String
});

app.post("/tasks", async (req, res) => {
  const task = new Task({ name: req.body.name });
  await task.save();
  res.send(task);
});

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.send(tasks);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => console.log("Server running on port 3000"));
