//init function thats called as the page loads. Displays previously saved games.
function init() {
  // get the saved game array
  var savedGamesObj = JSON.parse(localStorage.getItem("savedGamesObj")) || [];
  savedGamesObj.forEach(function (game) {
    var savedGameContainer = $("#saved-games");
    var newSavedGameButton = $("<button>")
      .text(game)
      .addClass("font-sans text-slate-100 bg-gray-400 text button")
      .attr("id", game)
      .on("click", fetchGameId);
    savedGameContainer.append(newSavedGameButton);
  });
}
init();

$("#game-btn").on("click", gameInputHandler);
$("#genre-btn").on("click", genreInputHandler);

// Check for a game input. Alert or carry on.
function gameInputHandler() {
  $("#review-container").text("");
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

// Check for a genre input. Alert or carry on.
function genreInputHandler(event) {
  event.preventDefault();
  var genreInput = $("#genre").val();
  if (genreInput === "" || null) {
    //alert text if nothing is inputted
    var genreAlertContainerEl = $("#genre-alert-container").text("");
    var genreAlertTextEl = $("<p>").text("Please enter a genre.");
    genreAlertContainerEl.append(genreAlertTextEl);
  } else {
    genreFetchResponse(genreInput);
  }
}

//Fetch and response handling for game search (uses what-to-play API)
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

//Fetch and response handling for game search (uses GiantBomb API)
//User key for GiantBomb: 74396db661dc842e2e30773ee2aa76fbd447cbc1
function genreFetchResponse(genreInput) {
  // 1. Call the genres api to get all genres (name, guid)
  var genreFetchUrl =
    "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/genres/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1&format=json&field_list=guid,name";

  var options = {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
      "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
      "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1",
    },
  };

  fetch(genreFetchUrl, options)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => console.error(err));

  // 2. Call the games api (limit 50)
  var gamesFetchUrl =
    "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/games/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1&format=json&sort=number_of_user_reviews:desc&limit=50&field_list=guid,id,name,aliases";

  options = {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
      "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
      "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1", //073c2f94ba69540e99d2b7e8b4cd3aebb2d9befb
    },
  };

  fetch(gamesFetchUrl, options)
    .then((response) => response.json())
    .then((response) => gamesResponseHandler(response))
    .catch((err) => console.error(err));

  function gamesResponseHandler(gameResponse) {
    // 3. Iterate/loop over the games that we get back
    for (i = 0; i < 50; i++) {
      //    a. Call Game api to get more details about the game, gives us the genre for that game
      var gameFetchUrl =
        "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/game/" +
        gameResponse.results[i].guid +
        "/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1&format=json&field_list=genres,name";

      options = {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
          "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
          "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1",
        },
      };

      fetch(gameFetchUrl, options)
        .then((gameResponse) => gameResponse.json())
        .then((gameResponse) => wrapperFunction(gameResponse))
        .catch((err) => console.error(err));

      function wrapperFunction(gameResponse) {
        var gameGenres = gameResponse.results.genres;
        if (gameGenres !== undefined) {
          gameGenres.forEach(function (genre) {
            if (genre.name == genreInput) {
              var genreContainer = $("#genre-container");
              var genreTitleEl = $("<p>")
                .text(gameResponse.results.name)
                .addClass("text-white text-center")
                .on("click", fetchGameId);
              genreContainer.append(genreTitleEl);
            }
          });
        }
      }
    }
  }
}

//Displays the results for the games search bar
function gameSearchHandler(gameData) {
  //empty alert container
  $("#game-alert-container").text("");
  //empty the search result container
  var searchResultContainer = $("#game-container").text("");

  //display search results, and add an avant listener to each result
  gameData.forEach(function (game) {
    var gameTitleEl = $("<p>")
      .text(game.game_name)
      .addClass("text-white text-center")
      .on("click", fetchGameId);
    searchResultContainer.append(gameTitleEl);
  });
}

//fetchGameId
function fetchGameId(event) {
  var clickedGameTitle = event.target.textContent;
  createSavedGameButton(clickedGameTitle);
  var reviewFetchUrl =
    "https://whatoplay.p.rapidapi.com/search?game=" + clickedGameTitle;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "whatoplay.p.rapidapi.com",
      "X-RapidAPI-Key": "29b518b889msh6fc361b3b9aec26p1e1231jsnc655b8c71d9a",
    },
  };

  fetch(reviewFetchUrl, options)
    .then((response) => response.json())
    .then((response) => getGameId(response))
    .catch((err) => console.error(err)); //200 error (can't connect)
}

// Saves and makes buttons for new saved games
function createSavedGameButton(gameTitle) {
  //get the saved searches from local storage, or an empty array if there isn't one
  var savedGamesObj = JSON.parse(localStorage.getItem("savedGamesObj")) || [];
  //filter out names that match what was inputted, to avoid duplicates
  savedGamesObj = savedGamesObj.filter(function (names) {
    return names !== gameTitle;
  });
  //push the inputted name and save to local storage
  savedGamesObj.push(gameTitle);
  localStorage.setItem("savedGamesObj", JSON.stringify(savedGamesObj));

  //TODO: if saved search already exists, don't create a new button
  var sameSavedGame = document.getElementById(gameTitle);
  if (sameSavedGame === null || undefined) {
    //get the saved game container
    var savedGameContainer = $("#saved-games");
    var newSavedGameButton = $("<button>")
      .text(gameTitle)
      .attr("id", gameTitle)
      .addClass("font-sans text-slate-100 bg-gray-400 text button")
      .on("click", fetchGameId);
    savedGameContainer.append(newSavedGameButton);
  } else {
    sameSavedGame.remove();
    //get the saved game container
    var savedGameContainer = $("#saved-games");
    var newSavedGameButton = $("<button>")
      .text(gameTitle)
      .addClass("font-sans text-slate-100 bg-gray-400 text button")
      .attr("id", gameTitle)
      .on("click", fetchGameId);
    savedGameContainer.append(newSavedGameButton);
  }
}

// Sorts results for the game platform to find the highest rated one
function getGameId(data) {
  dataArray = data;
  dataArray.sort(function (a, b) {
    return a.gamerscore - b.gamerscore;
  });
  fetchReview(dataArray[0].game_id);
}

// fetches and displays the review
function fetchReview(gameId) {
  var reviewFetchUrl =
    "https://whatoplay.p.rapidapi.com/game/critics?game_id=" + gameId;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "whatoplay.p.rapidapi.com",
      "X-RapidAPI-Key": "29b518b889msh6fc361b3b9aec26p1e1231jsnc655b8c71d9a",
    },
  };

  fetch(reviewFetchUrl, options)
    .then((response) => response.json())
    .then((response) => getObjKeys(response))
    .catch((err) => console.error(err)); //200 error (can't connect)

  function getObjKeys(info) {
    reviewInfo = Object.values(info)[0];
    $("#game-container").text("");
    $("#genre-container").text("");
    var reviewContainerEl = $("#review-container");

    //display game name data.game_name
    var gameReviewTitleEl = $("<p>")
      .addClass("border-slate-900 text-center decoration-white")
      .text(reviewInfo.data.game_name);
    reviewContainerEl.append(gameReviewTitleEl);

    //display overall score

    if (reviewInfo.data.gamerscore === null) {
      var gameReviewTitleEl = $("<p>")
        .addClass("border-slate-900 text-center decoration-white")
        .text("No review score was found.");
    } else {
      var gameReviewTitleEl = $("<p>")
        .addClass("border-slate-900 text-center decoration-white")
        .text("Review Score: ", reviewInfo.data.gamerscore);

      if (reviewInfo.data.gamerscore === null || undefined) {
        var gameReviewTitleEl = $("<p>").text("No review score was found.");
      } else {
        var gameReviewTitleEl = $("<p>").text(
          "Review Score: ",
          reviewInfo.data.gamerscore
        );
      }
      reviewContainerEl.append(gameReviewTitleEl);

      //display individual reveiws with author, critic score, date pub, quote
      var criticReviewContainer = $("<div>");
      var criticReviewData = reviewInfo.data.game_critic_reviews;
      criticReviewData.forEach(function (review) {
        //author
        var authorEl = $("<p>")
          .addClass("border-slate-900 text-center decoration-white")
          .text("Author: " + review.author);
        criticReviewContainer.append(authorEl);
        //critic score

        var criticScoreEl = $("<p>")
          .addClass("border-slate-900 text-center decoration-white")
          .text("Score: score here");

        var criticScoreEl = $("<p>")
          .addClass("")
          .text(
            "Score: " + review.criticscore.score + "/" + review.criticscore.best
          );

        criticReviewContainer.append(criticScoreEl);
        //date published
        var publishedEl = $("<p>")
          .addClass("border-slate-900 text-center decoration-white")
          .text("Date Published: " + review.date_published);
        criticReviewContainer.append(publishedEl);
        //quote
        var quoteEl = $("<p>")
          .addClass("border-slate-900 text-center decoration-white")
          .text("Quote: " + review.qoute);
        criticReviewContainer.append(quoteEl);
      });
      reviewContainerEl.append(criticReviewContainer);
    }
  }
}
