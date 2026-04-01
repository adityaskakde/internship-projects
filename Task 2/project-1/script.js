const songs = [
  {
    title: "Kesariya",
    artist: "Arijit Singh",
    src: "./assets/songs/46fec4e4139af41be204ae6618c8dd7a8fe326cb_L_qRP8H1o.mp3",
    cover: "./assets/cover/61JvF5HIDnL._AC_UF894,1000_QL80_.jpg"
  },
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    src: "./assets/songs/38bf61a5f3c30b3162296b1ff88663b45967f907_iIobEla0Y (1).mp3",
    cover: "./assets/cover/image.png"
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal",
    src: "./assets/songs/054f5adf6842340606adac53b39316d92107c74d_5265rkEW_.mp3",
    cover: "./assets/cover/Shershaah_soundtrack.jpg"
  }
];

const audio = new Audio();
let index = 0;
let isPlaying = false;

// elements
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const playlist = document.getElementById("playlist");
const playBtn = document.getElementById("play");
const heroPlay = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");

// load song
function loadSong() {
  const s = songs[index];

  title.textContent = s.title;
  artist.textContent = s.artist;
  cover.src = s.cover;
  audio.src = s.src;

  renderPlaylist();
}

// play
function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
}

// pause
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "▶";
}

// next / prev
function nextSong() {
  index = (index + 1) % songs.length;
  loadSong();
  playSong();
}

function prevSong() {
  index = (index - 1 + songs.length) % songs.length;
  loadSong();
  playSong();
}

// playlist UI
function renderPlaylist() {
  playlist.innerHTML = "";

  songs.forEach((s, i) => {
    const div = document.createElement("div");
    div.classList.add("song");

    if (i === index) div.classList.add("active");

    div.innerHTML = `<b>${s.title}</b><br><small>${s.artist}</small>`;

    div.onclick = () => {
      index = i;
      loadSong();
      playSong();
    };

    playlist.appendChild(div);
  });
}

// controls
playBtn.onclick = () => {
  isPlaying ? pauseSong() : playSong();
};

heroPlay.onclick = playSong;

document.getElementById("next").onclick = nextSong;
document.getElementById("prev").onclick = prevSong;

// progress
audio.addEventListener("timeupdate", () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + "%";
});

// seek
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  audio.currentTime = (e.offsetX / width) * audio.duration;
});

// auto next
audio.onended = nextSong;

// init
loadSong();