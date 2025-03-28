console.log("JavaScript is running...");
let currentSong = new Audio();
let songs = [];
let currentFolder = "public/songs";
let currentIndex = 0; // Track currently playing song index

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        currentFolder = `public/${folder}`;
        let response = await fetch(`${currentFolder}/`);
        if (!response.ok) throw new Error("Failed to fetch songs");
        let text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        songs = Array.from(anchors)
            .filter(a => a.href.endsWith(".mp3"))
            .map(a => decodeURIComponent(a.href.split(`/${folder}/`)[1]));

        updateSongListUI(songs);
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

function updateSongListUI(songs) {
    let songList = document.querySelector(".songlist ul");
    songList.innerHTML = songs.map(song => `
        <li>
            <img class="invert" src="public/img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Aanchal Seth</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="public/img/play.svg" alt="">
            </div>
        </li>`).join("");

    document.querySelectorAll(".songlist li").forEach((e, index) => {
        e.addEventListener("click", () => playMusic(index));
    });
}

const playMusic = (index, pause = false) => {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;  // Update global index tracker
    currentSong.src = `${currentFolder}/${songs[currentIndex]}`;

    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "public/img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = decodeURI(songs[currentIndex]);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        let response = await fetch("public/songs/");
        if (!response.ok) throw new Error("Failed to fetch albums");
        let text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        cardContainer.innerHTML = "";
        for (let e of anchors) {
            if (e.href.includes("/songs/")) {
                let folder = e.href.split("/").slice(-1)[0];
                let albumData = await fetch(`public/songs/${folder}/info.json`);
                if (!albumData.ok) continue;
                let metadata = await albumData.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card rounded">
                    <div class="play">
                        <img src="public/img/play.svg" alt="">
                    </div>
                    <img src="public/songs/${folder}/cover.jpg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
            }
        }

        document.querySelectorAll(".card").forEach(e => {
            e.addEventListener("click", async () => {
                await getSongs(`songs/${e.dataset.folder}`);
                playMusic(0);
            });
        });
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

async function main() {
    await getSongs("songs/allmoodsongs");
    playMusic(0, true);
    displayAlbums();

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "public/img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "public/img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerText =
                `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.clientX - e.target.getBoundingClientRect().left) / e.target.clientWidth * 100;
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
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(currentIndex);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(currentIndex);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => { 
        currentSong.volume = parseInt(e.target.value) / 100 
    });

    document.querySelector(".volume img").addEventListener("click", () => {
        if (currentSong.muted) {
            currentSong.muted = false;
            document.querySelector(".volume img").src = "public/img/volume.svg"; // Unmute icon
        } else {
            currentSong.muted = true;
            document.querySelector(".volume img").src = "public/img/mute.svg"; // Mute icon
        }
    });
    
    
}

main();
