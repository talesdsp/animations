const root = document.documentElement
const menu = document.querySelector(".context-menu")
const select = document.querySelector(".playback-rate")

gsap.registerPlugin(ScrollTrigger)

function VideoPlayer() {
  /* Get Our Elements */
  const player = document.querySelector(".player")
  const video = player.querySelector(".viewer")
  const progress = player.querySelector(".progress")
  const progressBar = player.querySelector(".progress__filled")
  const toggle = player.querySelector(".toggle")
  const skipButtons = player.querySelectorAll("[data-skip]")
  const ranges = player.querySelectorAll(".player__slider")

  /* Hook up the event listeners */
  // video.addEventListener("canplay", ()=>{})
  // video.addEventListener("seeking", ()=>{})
  // video.addEventListener("waiting", onWaiting)
  video.addEventListener("progress", onProgress)
  video.addEventListener("ratechange", onRateChange)
  video.addEventListener("stalled", onStalled)
  video.addEventListener("contextmenu", onContextMenu)
  video.addEventListener("click", onClick(togglePlay))
  video.addEventListener("dblclick", doubleClick)
  video.addEventListener("play", updateButton)
  video.addEventListener("pause", updateButton)
  video.addEventListener("timeupdate", handlePlayedProgress)
  player.addEventListener("keydown", onKeyDown)
  root.addEventListener("click", (e) => menu.classList.remove("visible"))
  select.addEventListener("input", (e) => (video.playbackRate = e.target.value))

  toggle.addEventListener("click", togglePlay)
  skipButtons.forEach((button) => button.addEventListener("click", skip))
  ranges.forEach((range) => range.addEventListener("change", handleRangeUpdate))
  ranges.forEach((range) =>
    range.addEventListener("mousemove", handleRangeUpdate),
  )

  let mousedown = false
  progress.addEventListener("click", scrub)
  progress.addEventListener("mousemove", (e) => mousedown && scrub(e))
  progress.addEventListener("mousedown", () => (mousedown = true))
  progress.addEventListener("mouseup", () => (mousedown = false))

  ScrollTrigger.create({
    trigger: ".player",
    start: "top center",
    scrub: true,
    onToggle: (self) => {
      self.isActive ? video.play() : video.pause()
    },
    markers: true,
  })

  /* Build out functions */
  function togglePlay(e) {
    const method = video.paused ? "play" : "pause"
    video[method]()
  }

  function updateButton(e) {
    const icon = e.target.paused ? "►" : "❚ ❚"
    toggle.textContent = icon
  }

  function skip(e) {
    video.currentTime += parseFloat(e.target.dataset.skip)
  }

  function handleRangeUpdate(e) {
    video[e.target.name] = e.target.value
  }

  function handlePlayedProgress() {
    const percent = (video.currentTime / video.duration) * 100
    progressBar.style.flexBasis = `${percent}%`
  }

  function scrub(e) {
    const scrubTime = (e.layerX / progress.offsetWidth) * video.duration
    video.currentTime = scrubTime
  }

  function forward() {
    video.currentTime += 10
  }

  function back() {
    video.currentTime -= 10
  }

  function doubleClick(e) {
    if (e.layerX > e.target.clientWidth / 2) forward()
    else back()
  }

  let clickTimeoutId = null
  function onClick(fn) {
    return (e) => {
      clearTimeout(clickTimeoutId)
      if (clickTimeoutId != null) return

      clickTimeoutId = setTimeout(() => {
        fn(e)
        clearTimeout(clickTimeoutId)
        clickTimeoutId = null
      }, 300)
    }
  }

  function onRateChange(e) {
    console.log(e)
    console.log("rateChanged")
  }

  function onStalled(e) {
    console.log(e)
    alert("video stalled, please refresh the page")
  }

  function onContextMenu(e) {
    e.preventDefault()
    menu.classList.add("visible")

    menu.style.setProperty("--px", e.x + "px")
    menu.style.setProperty("--py", e.y + "px")
    console.log(menu)
  }

  function toggleFullscreen() {
    if (player.hasAttribute("fullscreen")) {
      closeFullscreen()
    } else openFullscreen(player)

    player.toggleAttribute("fullscreen")

    function openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen()
      }
    }

    function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen()
      }
    }
  }

  function onKeyDown(e) {
    const commands = {
      f: toggleFullscreen,
      ArrowRight: forward,
      l: forward,
      ArrowLeft: back,
      j: back,
      " ": togglePlay,
      k: togglePlay,
    }

    Object.keys(commands).includes(e.key) ? commands[e.key]() : null
  }

  function onProgress(e) {
    for (let i = 0; i < e.target.buffered.length; i++) {
      console.log(e.target.buffered.start(i), "-", e.target.buffered.end(i))

      const percent = (video.currentTime / video.duration) * 100

      const el = document.createElement("div")

      el.classList.add("progress__buffering")
      el.style.width = `${percent}%`

      progress.appendChild(el)
    }
  }

  return {}
}
