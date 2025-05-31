let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
//Function to fetch the songs from the folder
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //showing all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
      <img class="invert" src="img/music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Song Artist</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img src="img/play.svg" alt="" class="invert" />
                </div>
      </li>`;
  }

  //Attach an event listener to play every song in the list

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play(track);
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbum() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").splice(-1)[0];

      //getting meta data of each of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 4L19 12L5 20V4Z"
            stroke="#141834"
            stroke-width="1.5"
            stroke-linejoin="round"
            fill="#141834"
          />
        </svg>
      </div>
      <img
        src="/songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }
  //Load the playlist when the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}
async function main() {
  //Displaying all the albums on the page
  displayAlbum();

  //Attach an event Listener to play next and previous song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  //For time duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    // if (
    //   document.querySelector(".songtime").innerHTML ==
    //   `${secondsToMinutesSeconds(
    //     currentSong.duration
    //   )} / ${secondsToMinutesSeconds(currentSong.duration)}`
    // ) {
    //   play.src = "img/play.svg";
    // }
  });

  //Adding event listener to seek the music
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Adding event listener for previous and next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    console.log(songs, index);
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  //Adding event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  //Adding event Listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  //Adding event to volume
  let range = document.querySelector(".range").getElementsByTagName("input")[0];

  range.addEventListener("change", (e) => {
    //Setting volume to target.value out of 100
    // console.log(e.target.value);
    currentSong.volume = parseInt(e.target.value) / 100;
  });
  let previousVol = null;
  let previousRange = null;
  //add event listener to mute the volume
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      previousRange = range.value;
      previousVol = currentSong.volume;
      // console.log(previousRange, previousVol);
      currentSong.volume = 0;
      range.value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = previousVol;
      range.value = previousRange;
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  main();
});
