<script lang="ts">
  import type { Socket } from "socket.io-client"
  import type { User, QuestionResult } from "../types"
  import { onMount } from "svelte"

  export let socket: Socket
  export let userList: User[]
  export let isAdmin: boolean

  let currQuestion: QuestionResult
  $: console.log("curr question", currQuestion);

  onMount(() => {
    // Prev/next question & update to current question participant answers
    socket.on("questionUpdate", (newQuestion: QuestionResult) => {
      currQuestion = newQuestion
    })

    socket.emit("requestCurrQuestion")
  })

  function handlePrevQuestion() {
    socket.emit("requestPrevQuestion")
  }

  function handleNextQuestion() {
    socket.emit("requestNextQuestion")
  }

  function handleOptionAResponse() {
    socket.emit("selectOptionA")
  }


  function handleOptionBResponse() {
    socket.emit("selectOptionB")
  }

</script>


<h3>Joined users:</h3>
{#each userList as user (user.socketId)}
  <p>{user.username}</p>
{/each}

<h2>Question:</h2>

{#if isAdmin}
  <button
    on:click={handlePrevQuestion}
  >
    Previous question
  </button>
  <button
    on:click={handleNextQuestion}
  >
    Next question
  </button>
{/if}

{#if currQuestion}
  <h3>{currQuestion.question}</h3>

  <div style="display: flex;">
    <div style="display: flex; flex-direction: column;">
      <button on:click={handleOptionAResponse}>
        {currQuestion.optionA}
      </button>

      {#each currQuestion.optionARespondents as respondent (respondent.socketId)}
        <p>{respondent.username}</p>
      {/each}
    </div>

    <div style="display: flex; flex-direction: column;">
      <button on:click={handleOptionBResponse}>
        {currQuestion.optionB}
      </button>

      {#each currQuestion.optionBRespondents as respondent (respondent.socketId)}
        <p>{respondent.username}</p>
      {/each}
    </div>
  </div>
{/if}
<!-- {#each questions as prompt}
  <p>{prompt.question}</p>
  <button>{prompt.optionA}</button>
  <button>{prompt.optionB}</button>
{/each} -->