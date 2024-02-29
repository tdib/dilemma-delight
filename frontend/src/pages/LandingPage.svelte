<script lang="ts">
  import type { Socket } from "socket.io-client"
  import type { User } from "../types"
  import { createEventDispatcher } from "svelte"

  export let socket: Socket
  export let userList: User[]

  let isAdmin: boolean
  const dispatch = createEventDispatcher<{ isAdminChange: boolean }>()
  function sendIsAdminToParent() {
    dispatch("isAdminChange", isAdmin)
  }

  const exampleNames = [
    "SillyBob123",
    "DibRox",
    "SweetRubiks",
    "SolidBunjee",
    "Smothered Laryngitis"
  ]

  let prevUsername: string
  let username: string

  let usernameInputField: HTMLInputElement

  let hasSetUser = false
  let isUsernameInputBlocked = false

  function performAdminCheck() {
    isAdmin = username === "Dib"
    sendIsAdminToParent()
  }

  function handleSubmitUsername() {
    console.log("Handling username");
    isUsernameInputBlocked = true
    hasSetUser = true
    performAdminCheck()
    socket.emit("usernameEntry", username)
  }

  function handleChangeUsername() {
    performAdminCheck()
    socket.emit("usernameChange", username)
  }

  function handleSessionStart() {
    socket.emit("sessionUpdate")
  }
</script>

<main>
  <h2>Create a name!</h2>

  <form>
    <input
      bind:this={usernameInputField}
      bind:value={username}
      disabled={isUsernameInputBlocked}
      placeholder={exampleNames[Math.floor(Math.random() * exampleNames.length)]}
    >

    {#if !hasSetUser}
      <button
        on:click={handleSubmitUsername}
        disabled={username === undefined}
      >
        Enter
      </button>
    {/if}

    {#if hasSetUser}
      {#if isUsernameInputBlocked}
        <button
          on:click={() => {
            isUsernameInputBlocked = false
            prevUsername = username
          }}
        >
          Change username
        </button>
      {:else}
        <button
          on:click={() => {
            isUsernameInputBlocked = true
            handleChangeUsername()
          }}
        >
          Save changes
        </button>
      {/if}
    {/if}

    {#if hasSetUser && !isUsernameInputBlocked}
      <button
        on:click={() => {
          isUsernameInputBlocked = true
          username = prevUsername
        }}
      >
        Cancel
      </button>
    {/if}
  </form>

  {#if isAdmin}
    <button
      on:click={handleSessionStart}
    >
      Start session!
    </button>
  {/if}

  <h2>Joined users:</h2>

  {#each userList as user (user.socketId)}
    <p>{user.username}</p>
  {/each}
</main>
