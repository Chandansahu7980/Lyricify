const searchBtn = document.getElementById("search-song-btn");
const inputField = document.getElementById("search-song");
inputField.focus();
function showNotification(message) {
  const notification = document.getElementById('notification');
  // const notificationMessage = document.getElementById('notification-message');
  notification.innerHTML = message;
  notification.classList.remove('hidden');
  notification.classList.add('visible');
  setTimeout(() => {
    notification.classList.remove('visible');
    notification.classList.add('hidden');
  }, 3000);
}


async function getAccessToken() {
  const response = await fetch("get-client-token.php"); // Adjust path if needed
  const data = await response.json();
  return data.access_token;
}

async function getSongLists() {
  const songResult = document.getElementById("song-result");
  const songName = inputField.value.trim();

  // Prevent API call if field is empty
  if (!songName) {
    showNotification("<span>⚠️</span> Search field cannot be empty!");
    return;
  }

  songResult.innerHTML = "<br><h2>🎧 Your song is fetching...</h2>";

  const token = await getAccessToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      songName
    )}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await res.json();

  songResult.innerHTML = "";

  if (result.tracks && result.tracks.items.length > 0) {
    result.tracks.items.forEach((element) => {
      let mySongDiv = document.createElement("div");
      mySongDiv.className = "song-card";
      mySongDiv.innerHTML = `
        <img src="${element.album.images[0].url}" alt="">
        <div class="song-details">
            <h3>${element.name}</h3>
            <p class="artist-name">${element.artists[0].name}</p>
            <p>${Math.floor(element.duration_ms / 60000)}:${String(
        Math.floor((element.duration_ms % 60000) / 1000)
      ).padStart(2, "0")}</p>
      <span class="album-name hide-div">${element.album.name}</span>
      <span class="song-duration hide-div">${element.duration_ms}</span>
        </div>`;
      songResult.appendChild(mySongDiv);
    });
    inputField.value = "";
    document.getElementById("lyrics-card").classList.remove("hide-div");

  } else {
    songResult.innerHTML = `<p style="color: red; text-align:center;">No Song Found</p>`;
  }
}

async function getLyric(songName, artist, albumName) {
  const apiUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(
    songName
  )}&artist_name=${encodeURIComponent(artist)}${albumName ? `&album_name=${encodeURIComponent(albumName)}` : ""
    }`;
  window.location.href = '#lyrics-card';
  let lyricsDiv = document.getElementById("lyric-of-song");
  lyricsDiv.innerHTML = "<br><h2>🎼Fetching the lyrics...</h2>";
  try {
    const response = await fetch(apiUrl);
    const lyricsResult = await response.json();
    if (lyricsResult && lyricsResult.plainLyrics) {
      let lines = lyricsResult.plainLyrics.split("\n");
      lyricsDiv.innerHTML = "";
      let filteredLines = lines.filter((tempLine) => tempLine !== "");
      filteredLines.forEach((line) => {
        let p = document.createElement("p");
        p.textContent = line;
        p.classList.add("lyric-line");
        p.addEventListener("click", () => {
          const selectedLines = document.querySelectorAll(".lyric-line.selected-lyrics");

          if (p.classList.contains("selected-lyrics")) {
            p.classList.toggle("selected-lyrics");
          } else {
            if (selectedLines.length < 6) {
              p.classList.add("selected-lyrics");
            } else {
              showNotification("<span>🔔</span>Maximum lines seletced!")
              return;
            }
          }
        });
        lyricsDiv.appendChild(p);
      });
      document.getElementById("create-card").style.display = "flex";
    } else {
      lyricsDiv.innerHTML = "<h3 style='color:red;'>Lyrics not available.</h3>";
    }
  } catch (err) {
    lyricsDiv.innerHTML = "<h3 style='color:red;'>Lyrics not available.</h3>";
  }
}

searchBtn.addEventListener("click", getSongLists);

inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    getSongLists();
  }
});

// Handle clicking on a song card
const clickedDiv = document.getElementById("song-result");
clickedDiv.addEventListener("click", (e) => {
  const clickedSong = e.target.closest(".song-card");

  if (clickedSong) {
    const songName = clickedSong.querySelector(".song-details h3").textContent;
    const artist = clickedSong.querySelector(".artist-name").textContent;
    const duration = clickedSong.querySelector(".song-duration").textContent;
    const albumName = clickedSong.querySelector(".album-name").textContent;
    const resultDiv = document.getElementById("clicked-song");
    const mySelectedSong = document.createElement("div");
    mySelectedSong.className = "song-card";
    mySelectedSong.innerHTML = clickedSong.innerHTML;
    resultDiv.innerHTML = "";

    resultDiv.appendChild(mySelectedSong);

    getLyric(songName, artist, albumName);
  }
});

function makeCard(song, lyricsLines) {
  document.getElementById("preview-card").classList.remove("hide-div");
  window.location.href = '#preview-card';
  let songCard = document.getElementById("song-name-artist");
  let myCard = document.getElementById("card-jpg");
  let myLyricsDiv = document.getElementById("final-lyric");
  let cardBgColor = document.getElementById("bg-color-picker").value;
  let cardfontColor = document.getElementById("font-color-picker").value;
  let fontSizeValue = document.getElementById("font-size-picker").value;
  songCard.innerHTML = song.innerHTML;
  songCard.querySelector(".song-details p:nth-child(3)").style.display = "none";

  myLyricsDiv.innerHTML = '';
  lyricsLines.forEach((key) => {
    myLyricsDiv.innerHTML += key.innerHTML;
    myLyricsDiv.innerHTML += "<br>";
  });
  let myLyrics = document.getElementById("final-lyric");
  myCard.style.backgroundColor = cardBgColor;
  myLyrics.style.color = cardfontColor;
  console.log(fontSizeValue);
  myLyrics.style.fontSize = `${1 + fontSizeValue / 100} + "rem"`;
}

function downloadCard() {
  console.log("function called.");
  const card = document.getElementById("card-jpg");
  html2canvas(card, {
    useCORS: true,   // Enable cross-origin images
    allowTaint: false,
    logging: false,
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

async function shareCard() {
  const card = document.getElementById("card-jpg");

  const canvas = await html2canvas(card, {
    useCORS: true,
    allowTaint: false,
    logging: false,
  });

  const dataUrl = canvas.toDataURL("image/png");

  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], "card.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "My Card",
        text: "Check out this card!",
        files: [file],
      });
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  } else {
    alert("Sharing not supported on this browser or device.");
  }
}

const downloadBtn = document.getElementById("download-card");
downloadBtn.addEventListener("click", downloadCard);

const shareBtn = document.getElementById("share-card");
shareBtn.addEventListener("click", shareCard);

document.getElementById("create-card").addEventListener("click", () => {

  const selectedLines = document.querySelectorAll(".lyric-of-song .selected-lyrics");
  if (selectedLines.length <= 0) {
    showNotification("<span>⚠️</span>Please select a line to continue");
    return;
  }

  const selectedSong = document.querySelector(".lyrics-card #clicked-song .song-card");
  // console.log(selectedSong);


  let selectedLinesLyric = [];

  // console.log(selectedLines);
  selectedLines.forEach((key) => {
    let line = document.createElement("p");
    line.innerText = key.innerText;
    selectedLinesLyric.push(line);
    // console.log(key.innerText)
  });

  makeCard(selectedSong, selectedLinesLyric);

});

const cardBgColor = document.getElementById("bg-color-picker");
const cardfontColor = document.getElementById("font-color-picker");
const fontSizeValue = document.getElementById("font-size-picker");

cardBgColor.addEventListener("input", () => {
  let myCard = document.getElementById("card-jpg");
  let cardBgColor = document.getElementById("bg-color-picker").value;
  myCard.style.backgroundColor = cardBgColor;
});

cardfontColor.addEventListener("input", () => {
  let myLyrics = document.getElementById("final-lyric");
  let cardfontColor = document.getElementById("font-color-picker").value;
  myLyrics.style.color = cardfontColor;
});

fontSizeValue.addEventListener("input", () => {
  let myLyrics = document.getElementById("final-lyric");
  console.log(1 + fontSizeValue.value / 100 + "rem");
  let valueToBe = 1 + fontSizeValue.value / 100 + "rem";
  myLyrics.style.fontSize = valueToBe;
})

document.getElementById("bold-lyric").addEventListener("click", () => {
  let myLyrics = document.getElementById("final-lyric");
  myLyrics.classList.toggle("bold-text");
});

document.getElementById("italic-text").addEventListener("click", () => {
  let myLyrics = document.getElementById("final-lyric");
  myLyrics.classList.toggle("italic-text");
});

document.getElementById("lyric-font-style").addEventListener("change", () => {
  let selectedFontFamily = document.getElementById("lyric-font-style").value;
  let myLyrics = document.getElementById("final-lyric");
  myLyrics.style.fontFamily = selectedFontFamily;
});

