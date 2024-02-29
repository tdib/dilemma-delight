export type User = {
  socketId: string,
  username: string
}

export type QuestionResult = {
  question: string,
  optionA: string,
  optionARespondents: User[]
  optionB: string,
  optionBRespondents: User[]
}