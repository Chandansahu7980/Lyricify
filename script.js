const searchBtn = document.getElementById("search-song-btn");
const inputField = document.getElementById("search-song");
const notification = document.getElementById("notification");
inputField.focus();

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
    // alert("Search field cannot be empty!");
    notification.innerText = "Search field cannot be empty!";
    notification.style.transform = "translateX(1%)";

    setInterval(() => {
      notification.style.transform = "translateX(-100%)";
    }, 2000);
    return;
  }

  songResult.innerHTML = "<br><h2>🎧 Your song is fetching...</h2>";

  const token = await getAccessToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      songName
    )}&type=track&limit=3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await res.json();

  songResult.innerHTML = ""; // Clear old results before showing new ones

  if (result.tracks && result.tracks.items.length > 0) {
    result.tracks.items.forEach((element) => {
      // console.log(element);
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
      <span class="album-name hidden">${element.album.name}</span>
      <span class="song-duration hidden">${element.duration_ms}</span>
        </div>`;
      songResult.appendChild(mySongDiv);
    });
    inputField.value = "";
  } else {
    // console.log("No Song Found");
    songResult.innerHTML = `<p style="color: red; text-align:center;">No Song Found</p>`;
  }
}

async function getLyric(songName, artist, albumName) {
  const apiUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(
    songName
  )}&artist_name=${encodeURIComponent(artist)}${albumName ? `&album_name=${encodeURIComponent(albumName)}` : ""
    }`;

  let lyricsDiv = document.getElementById("lyric-of-song");
  lyricsDiv.innerHTML = "<p>Fetching the Lyrics...</p>";

  try {
    const response = await fetch(apiUrl);
    const lyricsResult = await response.json();

    if (lyricsResult && lyricsResult.plainLyrics) {
      // console.log(lyricsResult.plainLyrics);
      let lines = lyricsResult.plainLyrics.split("\n");
      lyricsDiv.innerHTML = "";
      // console.log(lines);
      let filteredLines = lines.filter((tempLine) => tempLine !== "");
      // console.log(filteredLines);
      filteredLines.forEach((line) => {
        let p = document.createElement("p");
        p.textContent = line;
        p.classList.add("lyric-line");

        //Allow selecting lines
        p.addEventListener("click", () => {
          const selectedLines = document.querySelectorAll(
            ".lyric-line.selected-lyrics"
          );

          if (p.classList.contains("selected-lyrics")) {
            //If already selected remove it.
            p.classList.remove("selected-lyrics");
          } else {
            //Allow only if less than 5 lines
            if (selectedLines.length < 6) {
              p.classList.add("selected-lyrics");
            } else {
              // notification.innerText = "Search field cannot be empty!";
              notification.innerText = "Maximum lines seletced!";
              notification.style.transform = "translateX(1%)";
              setInterval(() => {
                notification.style.transform = "translateX(-100%)";
              }, 3000);
              return;
            }
          }
        });

        lyricsDiv.appendChild(p);
      });
    } else {
      lyricsDiv.innerHTML = "<p style='color:red;'>Lyrics not available.</p>";
    }
  } catch (err) {
    // console.log(err);
    lyricsDiv.innerHTML = "<p style='color:red;'>Lyrics not available.</p>";
  }
}

// Search song when button is clicked
searchBtn.addEventListener("click", getSongLists);

// Search song when Enter is pressed in the input
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
    // const image = clickedSong.querySelector("img").src;
    const songName = clickedSong.querySelector(".song-details h3").textContent;
    const artist = clickedSong.querySelector(".artist-name").textContent;
    const duration = clickedSong.querySelector(".song-duration").textContent;
    const albumName = clickedSong.querySelector(".album-name").textContent;
    // console.log(songName, artist, duration, albumName);
    // console.log(clickedSong);
    const resultDiv = document.getElementById("clicked-song");
    const mySelectedSong = document.createElement("div");
    mySelectedSong.className = "song-card";
    mySelectedSong.innerHTML = clickedSong.innerHTML;
    // console.log(mySelectedSong);
    resultDiv.innerHTML = "";

    resultDiv.appendChild(mySelectedSong);

    getLyric(songName, artist, albumName);
  }
});

function makeCard(song, lyricsLines) {
  let songCard = document.getElementById("song-name-artist");
  let myCard = document.getElementById("card-jpg");
  let myLyricsDiv = document.getElementById("final-lyric");
  let cardBgColor = document.getElementById("bg-color-picker").value;
  let cardfontColor = document.getElementById("font-color-picker").value;
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

}

document.getElementById("create-card").addEventListener("click", () => {

  const selectedLines = document.querySelectorAll(".lyric-of-song .selected-lyrics");
  if (selectedLines.length <= 0) {
    // console.log("Please select a line to continue");
    notification.innerText = "Please select a line to continue";
    notification.style.transform = "translateX(1%)";
    setInterval(() => {
      notification.style.transform = "translateX(-100%)";
    }, 2000);
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

cardBgColor.addEventListener("change", () => {
  let myCard = document.getElementById("card-jpg");
  let cardBgColor = document.getElementById("bg-color-picker").value;
  myCard.style.backgroundColor = cardBgColor;
});
cardfontColor.addEventListener("change", () => {
  let myLyrics = document.getElementById("final-lyric");
  let cardfontColor = document.getElementById("font-color-picker").value;
  myLyrics.style.color = cardfontColor;
});

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

