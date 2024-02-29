<script lang="ts">
  import { onMount } from "svelte"
  import type { Socket } from "socket.io-client"
  import type { User } from "../types"
  import io from "socket.io-client"
  import LandingPage from "../pages/LandingPage.svelte"
  import GamePage from "../pages/GamePage.svelte"
  import Image from "../pages/Image.svelte"

  let imageNames = [
    "dibearhoodie.png",
    "dibhoodpull.png",
    "diblaydown.png",
    "dibskate.png",
    "dibthing.png",
    "dibtoiletrollthing.png",
    "dibtpclaydown.png",
    "dibvr.png",
    "dibwhat.png",
  ]

  let socket: Socket

  let hasSessionStarted = false
  let isAdmin = false

  $: console.log("root level: is admin?", isAdmin);

  function handleIsAdminChange(event: CustomEvent<boolean>) {
    isAdmin = event.detail
  }

  let userList: User[] = []

  onMount(() => {
    // socket = io("http://localhost:3000")
    socket = io("https://api.dilemma-delight.tdib.xyz")

    socket.on("userListUpdate", (newUserList: User[]) => {
      console.log("received from server:", newUserList);
      userList = newUserList
    })

    socket.on("sessionUpdate", (sessionStatus: boolean) => {
      hasSessionStarted = sessionStatus
    })

  })
</script>


{#if hasSessionStarted}
  <GamePage socket={socket} userList={userList} isAdmin={isAdmin} />
{:else}
  <LandingPage
    socket={socket}
    userList={userList}
    on:isAdminChange={handleIsAdminChange}
  />
{/if}

{#each imageNames as imageName}
  <Image imageName={imageName} />
{/each}
