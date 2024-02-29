<script lang="ts">
  import { onMount } from "svelte"

  export let imageName: string

  $: innerWidth = 0
  $: innerHeight = 0

  $: xLoc = Math.max(Math.floor(Math.random() * innerWidth), 100)
  $: yLoc = Math.max(Math.floor(Math.random() * innerHeight), 100)

  let xFlip = Math.random() < 0.5 ? 1 : -1
  let yFlip = Math.random() < 0.5 ? 1 : -1

  let xSpeed = Math.random()
  let ySpeed = Math.random()

  onMount(() => {
    let frame: ReturnType<typeof requestAnimationFrame>
    
    const loop = () => {
      xLoc += xSpeed * xFlip
      yLoc += ySpeed * yFlip

      if (xLoc <= 100 || xLoc >= innerWidth) {
        xFlip *= -1
      }

      if (yLoc <= 100 || yLoc >= innerHeight) {
        yFlip *= -1
      }
      requestAnimationFrame(loop)
    }

    loop()

    return () => {
      cancelAnimationFrame(frame)
    }
  })


</script>

<svelte:window bind:innerWidth bind:innerHeight />

<img
  src="/{imageName}"
  alt="dib"
  width=100
  style="--left: {xLoc}px; --top: {yLoc}px;"
>

<style>
  img {
    position: absolute;
    z-index: -9999;
    left: calc(var(--left) - 100px);
    top: calc(var(--top) - 100px);
  }
</style>