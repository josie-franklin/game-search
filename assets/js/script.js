//init function that displays previous searches from local storage
//  var savedSearchesObj = JSON.parse(localStorage.getItem("savedSearchesObj")) || [];

$("#game-btn").on("click", gameFetchResponse);
$("#genre-btn").on("click", genreFetchResponse);

//fetch and response handling for game search (use one API)
function gameFetchResponse() {
  var gameInput = $("#game-input").val().trim();
  var fetchUrl = "https://whatoplay.p.rapidapi.com/search?game=" + gameInput;

  //fetch variables from whattoplay documentation start
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "whatoplay.p.rapidapi.com",
      "X-RapidAPI-Key": "29b518b889msh6fc361b3b9aec26p1e1231jsnc655b8c71d9a",
    },
  };
  //fetch variables from whattoplay documentation end

  fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));

  //   if response works, searchHandler
  //   if 400, searchErrorHandler
  //   if 200, searchConnectionErrorHandler
}

//fetch and response handling for genre search (use a different API, probably gamebomb)
//my user key for giantbomb: 74396db661dc842e2e30773ee2aa76fbd447cbc1
//----------------------------------------------------------------------------------------
function genreFetchResponse() {
  var genreInput = $("#genre-input").val().trim();
  var genreFetchUrl =
    "https://www.giantbomb.com/api/game/3030-4725/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1"; //url works in browser bar, not in html

  fetch(genreFetchUrl).then(function (response) {
    console.log(response.json());
  });

  //if response works, searchHandler
  //if 400, searchErrorHandler
  //if 200, searchConnectionErrorHandler
}
//----------------------------------------------------------------------------------------

//searchHandler
//save genre or game title to local storage (savedSearchesObj) (wait for an ok response)
//display new saved search to the saved searches buttons
//if saved searha already exists, don't create a new button
//display search results (game list)
//event listener on each of the results (probably an <a> tag) that runs fetchReview

//fetchReview
//fetches reveiw using game title as query (whattoplay API)
//if response works, gameHandler
//if 400, gameErrorHandler
//if 200, gameConnectionErrorHandler

//gameHandler
//save game to local storage (savedGamesObj)
//display new saved game to the saved games buttons
//if saved game already exists, dont create a new button
//display game title
//display game reveiw
