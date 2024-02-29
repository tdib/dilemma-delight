import express from "express"
import * as http from "http"
import { Server } from "socket.io"
import cors from "cors"
import questionData from "./questionData.json"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  }
})

app.use(cors());

type User = {
  socketId: string,
  username: string
}
let users: User[] = []
let hasSessionStarted = false

let questionPtr = 0
type QuestionResult = {
  question: string,
  optionA: string,
  optionARespondents: User[]
  optionB: string,
  optionBRespondents: User[]
}
let questionResults: QuestionResult[] = questionData.map((data) => ({
  question: data.question,
  optionA: data.optionA,
  optionARespondents: [],
  optionB: data.optionB,
  optionBRespondents: [],
}))
console.log(questionResults);

function refreshUsersOnClient() {
  io.emit("userListUpdate", users)
}

function refreshQuestion() {
  io.emit("questionUpdate", questionResults[questionPtr])
}



io.on("connection", (socket) => {
  console.log("A user connected")

  // Initial update for user on load
  refreshUsersOnClient()

  // User setting name for the first time
  socket.on("usernameEntry", (username) => {
    console.log("Username entry:", username);
    const newUser: User = {
      socketId: socket.id,
      username: username
    }
    users.push(newUser)
    refreshUsersOnClient()
  })

  // User changing name (after setting an initial name)
  socket.on("usernameChange", (username) => {
    users = users.map((user) => user.socketId === socket.id ? { ...user, username: username } : user)
    refreshUsersOnClient()
  })

  // Start the game session for all users
  socket.on("sessionUpdate", () => {
    hasSessionStarted = true
    io.emit("sessionUpdate", hasSessionStarted)
  })

  // Retrieve the current question
  socket.on("requestCurrQuestion", () => {
    io.emit("questionUpdate", questionResults[questionPtr])
  })

  // Go back to the previous question - if we are already at the first, do nothing
  socket.on("requestPrevQuestion", () => {
    if (questionPtr > 0) {
      questionPtr--
    }
    io.emit("questionUpdate", questionResults[questionPtr])
  })

  // Go to the next question - if we are already at the end, do nothing
  socket.on("requestNextQuestion", () => {
    if (questionPtr < questionResults.length - 1) {
      questionPtr++
    }
    refreshQuestion()
  })

  // Return the number of questions
  socket.on("requestQuestionCount", () => {
    io.emit("questionCount", questionData.length)
  })

  socket.on("selectOptionA", () => {
    let currUser = users.find((user) => user.socketId === socket.id)
    questionResults[questionPtr].optionBRespondents =
      questionResults[questionPtr].optionBRespondents.filter((user) => user.socketId !== socket.id)
    
    if (!questionResults[questionPtr].optionARespondents.find((user) => user.socketId === socket.id)) {
      questionResults[questionPtr].optionARespondents.push(currUser)
    }
    refreshQuestion()
  })

  socket.on("selectOptionB", () => {
    let currUser = users.find((user) => user.socketId === socket.id)
    questionResults[questionPtr].optionARespondents =
      questionResults[questionPtr].optionARespondents.filter((user) => user.socketId !== socket.id)

    if (!questionResults[questionPtr].optionBRespondents.find((user) => user.socketId === socket.id)) {
      questionResults[questionPtr].optionBRespondents.push(currUser)
    }
    refreshQuestion()
  })

  // When a user drops the connection, remove them from the user list
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id)
    console.log("Users a", users);
    users = users.filter((user) => user.socketId !== socket.id)
    console.log("Users b", users);
    console.log("---");
    refreshUsersOnClient()
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.get("/", (req, res) => {
  res.send("hello world")
})
