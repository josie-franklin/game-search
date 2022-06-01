//init function that displays previous searches from local storage
//var savedSearchesObj = JSON.parse(localStorage.getItem("savedSearchesObj")) || [];

$("#game-btn").on("click", gameInputHandler);
$("#genre-btn").on("click", genreInputHandler);

function gameInputHandler() {
  var gameInput = $("#game-input").val().trim();
  if (gameInput === "" || null) {
    //alert text if nothing is inputted
    var gameAlertContainerEl = $("#game-alert-container").text("");
    var gameAlertTextEl = $("<p>").text("Please enter a game.");
    gameAlertContainerEl.append(gameAlertTextEl);
  } else {
    gameFetchResponse(gameInput);
  }
}

function genreInputHandler() {
  var genreInput = $("#genre-input").val().trim();
  if (genreInput === "" || null) {
    //alert text if nothing is inputted
    var genreAlertContainerEl = $("#genre-alert-container").text("");
    var genreAlertTextEl = $("<p>").text("Please enter a genre.");
    genreAlertContainerEl.append(genreAlertTextEl);
  } else {
    genreFetchResponse(genreInput);
  }
}

//fetch and response handling for game search (use one API)
function gameFetchResponse(gameInput) {
  var fetchUrl = "https://whatoplay.p.rapidapi.com/search?game=" + gameInput;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "whatoplay.p.rapidapi.com",
      "X-RapidAPI-Key": "29b518b889msh6fc361b3b9aec26p1e1231jsnc655b8c71d9a",
    },
  };

  fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => checkForGame(response))
    .catch((err) => console.error(err)); //200 error (can't connect)

  function checkForGame(response) {
    if (response.length === 0) {
      var gameAlertContainerEl = $("#game-alert-container").text("");
      var gameAlertTextEl = $("<p>").text("No game was found.");
      gameAlertContainerEl.append(gameAlertTextEl);
    } else {
      gameSearchHandler(response);
    }
  }
}

//fetch and response handling for genre search (use a different API, probably gamebomb) (does not currently work)
//my user key for giantbomb: 74396db661dc842e2e30773ee2aa76fbd447cbc1
//----------------------------------------------------------------------------------------
function genreFetchResponse(genreInput) {
  var genreFetchUrl =
    "https://www.giantbomb.com/api/game/3030-4725/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1"; //url works in browser bar, not in html

  const options = {
    method: "GET",
    headers: {
      host: "url",
      key: "keystring",
    },
  };

  fetch(genreFetchUrl)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err)); //200 error (can't connect)

  //if response works, genreSearchHandler
  //if 400, genreNotFoundHandler
}
//----------------------------------------------------------------------------------------

//gameSearchHandler
function gameSearchHandler(gameData) {
  //empty alert container
  $("#game-alert-container").text("");
  //empty the search result container
  var searchResultContainer = $("#container").text("");
  //get the searched game
  var gameSearch = $("#game-input").val().trim();
  //get the saved searches from local storage, or an empty array if there isn't one
  var savedSearchesObj =
    JSON.parse(localStorage.getItem("savedSearchesObj")) || [];
  //filter out names that match what was inputted, to avoid duplicates (!!! CURRENTLY SEES CAPS AS DIFFERENT FROM LOWERCASE)
  savedSearchesObj = savedSearchesObj.filter(function (names) {
    return names !== gameSearch;
  });
  //push the inputted name and save to local storage
  savedSearchesObj.push(gameSearch);
  localStorage.setItem("savedSearchesObj", JSON.stringify(savedSearchesObj));

  //TODO: display new saved search to the saved searches buttons
  //TODO: if saved search already exists, don't create a new button

  //display search results, and add an avant listener to each result
  gameData.forEach(function (game) {
    var gameTitleEl = $('<p>').text(game.game_name).on('click', fetchReview);
    searchResultContainer.append(gameTitleEl);
  });
}

//fetchReview
function fetchReview() {
  console.log('function coming soon')
}
//fetches reveiw using game title as query (whattoplay API)
//if response works, gameHandler
//if 400, gameErrorHandler
//if 200, gameConnectionErrorHandler

//gameReviewHandler
//save game to local storage (savedGamesObj)
//display new saved game to the saved games buttons
//if saved game already exists, dont create a new button
//display game title
//display game reveiw
