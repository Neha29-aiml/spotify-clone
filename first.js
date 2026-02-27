console.log("START")

let currentSong = new Audio()
let songs = []
let currFolder = ""
let currentIndex = 0


function secondsToMinutesSeconds(seconds) {

    if (isNaN(seconds) || seconds < 0) return "00:00"

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}



async function getSongs(folder) {

    currFolder = folder

    let res = await fetch(`/${folder}/`)
    let html = await res.text()

    let div = document.createElement("div")
    div.innerHTML = html

    let links = div.getElementsByTagName("a")

    songs = []

    for (let link of links) {

        if (link.href.endsWith(".mp3")) {

            let song = decodeURIComponent(link.href.split("/").pop())

            songs.push(song)
        }
    }

    return songs
}



function renderSongList() {

    let ul = document.querySelector(".songlist ul")

    ul.innerHTML = ""

    songs.forEach(song => {

        ul.innerHTML += `
        <li data-song="${song}">
            <img class="invert" src="images/music.svg">

            <div class="info">
                <div>${song}</div>
                <div>Artist</div>
            </div>

            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="images/play.svg">
            </div>
        </li>`
    })


    document.querySelectorAll(".songlist li").forEach(li => {

        li.addEventListener("click", () => {

            let track = li.dataset.song

            playMusic(track)
        })
    })
}



function playMusic(track, pause = false) {

    currentIndex = songs.indexOf(track)

    currentSong.src = `/${currFolder}/` + track

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
    }
}



async function displayAlbums() {

    let res = await fetch("/songs/")
    let text = await res.text()

    let div = document.createElement("div")
    div.innerHTML = text

    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")

    cardContainer.innerHTML = ""

    for (let e of anchors) {

        let href = e.getAttribute("href")

        if (!href) continue

        if (href.includes("songs") && !href.includes(".htaccess")) {

            let parts = href.split("/")

            let folder = parts[parts.length - 2]

            if (!folder) continue

            let infoRes = await fetch(`/songs/${folder}/info.json`)
            let info = await infoRes.json()

            cardContainer.innerHTML += `
            <div class="card" data-folder="${folder}">

                <img src="/songs/${folder}/cover.jpg">

                <h2>${info.title}</h2>

                <p>${info.description}</p>

            </div>`
        }
    }

    // attach listeners AFTER cards exist
    document.querySelectorAll(".card").forEach(card => {

        card.addEventListener("click", async () => {

            let folder = card.dataset.folder

            songs = await getSongs(`songs/${folder}`)

            renderSongList()

            playMusic(songs[0])
        })
    })
}

async function main() {

    await displayAlbums()

    songs = await getSongs("songs/English_songs")

    renderSongList()

    playMusic(songs[0], true)



    play.addEventListener("click", () => {

        if (currentSong.paused) {

            currentSong.play()
            play.src = "images/pause.svg"

        } else {

            currentSong.pause()
            play.src = "images/play.svg"
        }
    })


    previous.addEventListener("click", () => {

        if (currentIndex > 0) {

            playMusic(songs[currentIndex - 1])
        }
    })


    next.addEventListener("click", () => {

        if (currentIndex < songs.length - 1) {

            playMusic(songs[currentIndex + 1])
        }
    })


    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML =

            `${secondsToMinutesSeconds(currentSong.currentTime)} /
        ${secondsToMinutesSeconds(currentSong.duration)}`


        document.querySelector(".circle").style.left =

            (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        document.querySelector(".circle").style.left = percent + "%"

        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    // volume slider
document.querySelector(".range input").addEventListener("input", (e) => {

    let volume = parseInt(e.target.value) / 100

    currentSong.volume = volume

    if(volume > 0){
        document.querySelector(".volume>img").src = "images/volume.svg"
    } else {
        document.querySelector(".volume>img").src = "images/mute.svg"
    }
})


// mute button
document.querySelector(".volume>img").addEventListener("click", (e)=>{

    if(currentSong.volume > 0){

        currentSong.volume = 0

        document.querySelector(".range input").value = 0

        e.target.src = "images/mute.svg"

    } else {

        currentSong.volume = 0.1

        document.querySelector(".range input").value = 10

        e.target.src = "images/volume.svg"
    }

})


    // ⭐ HAMBURGER MENU
    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = "0"

    })

    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%"

    })
}

document.addEventListener("DOMContentLoaded", () => {
    main()
})