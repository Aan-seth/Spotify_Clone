console.log("javascript likhege ab");
let currentSong = new Audio();
let songs;
let currentfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(folder) {
    currentfolder = folder;
    let a = await fetch(`/public/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
        }
    }
    
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML += `
            <li> 
                <img class="invert" src="/public/img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Aanchal Seth</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/public/img/play.svg" alt="">
                </div>
            </li>`;
    }
    
    document.querySelectorAll(".songlist li").forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info>div").innerText.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/public/${currentfolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "/public/img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/public/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (const e of anchors) {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            let metadata = await fetch(`/public/songs/${folder}/info.json`);
            let response = await metadata.json();
            
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card rounded">
                    <div class="play">
                        <img src="/public/img/play.svg" alt="">
                    </div>
                    <img src="/public/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }
    
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getsongs(`songs/${e.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getsongs("songs/allmoodsongs");
    playMusic(songs[0], true);
    displayAlbums();
    
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "/public/img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "/public/img/play.svg";
        }
    });
    
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)}/ ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
    
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
    
    document.getElementById("previous").addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentSong.src.split("/").pop()); // Extract filename
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
    
    document.getElementById("next").addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentSong.src.split("/").pop()); // Extract filename
        let index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
    
    
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });
    
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "/public/img/mute.svg";
            currentSong.volume = 0;
        } else {
            e.target.src = "/public/img/volume.svg";
            currentSong.volume = 0.1;
        }
    });
    document.getElementById("volume-icon").addEventListener("click", () => {
        if (currentSong.muted) {
            currentSong.muted = false;
            document.getElementById("volume-icon").src = "public/img/volume.svg"; // Unmute icon
        } else {
            currentSong.muted = true;
            document.getElementById("volume-icon").src = "public/img/mute.svg"; // Mute icon
        }
    });

    
}

main();