//init function that displays previous searches from local storage
//var savedSearchesObj = JSON.parse(localStorage.getItem("savedSearchesObj")) || [];

$("#game-btn").on("click", gameInputHandler);
$("#genre-btn").on("click", genreInputHandler);
var gamesInfo = [];

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

// 1. Call the genres api to get all genres (name, guid)
function genreFetchResponse(genreInput) {
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

  //if response works, genreSearchHandler
  //if 400, genreNotFoundHandler

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
              console.log("match", gameResponse.results.name);
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

      // for (j = 0; j < gameResponse.results.genres.length; j++) {
      //   //    b. If the genre matches what we are looking for, add that to an array
      //   // console.log(gameResponse.results.genres[0].name);
      //   if (gameResponse.results.genres[0].name == genreInput) {
      //     gamesInfo.push(gamesResponse.results[i]);
      //     console.log(gamesInfo);
      //     break;
      //   }
      // }
    }

    // //    c. Keep looping until we have the number games we want to show (like we want to present the user with 10 action games, loop until we have 10 action games in our array)
    // if (gamesInfo.length > 9) {
    //   break;
    // }
  }
}

//----------------------------------------------------------------------------------------

//gameSearchHandler
function gameSearchHandler(gameData) {
  //empty alert container
  $("#game-alert-container").text("");
  //empty the search result container
  var searchResultContainer = $("#game-container").text("");
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

function getGameId(data) {
  dataArray = data;
  dataArray.sort(function (a, b) {
    return a.gamerscore - b.gamerscore;
  });
  fetchReview(dataArray[0].game_id);
}

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
    console.log(reviewInfo);
    $('#game-container').text("");
    $('#genre-container').text("");
    var reviewContainerEl = $('#review-container');

    //display game name data.game_name
    var gameReviewTitleEl = $('<p>').text(reviewInfo.data.game_name);
    reviewContainerEl.append(gameReviewTitleEl);

    //display overall score
    if(reviewInfo.data.gamerscore === null) {
    var gameReviewTitleEl = $('<p>').text('No review score was found.');
    } else {
      var gameReviewTitleEl = $('<p>').text('Review Score: ', reviewInfo.data,gamerscore);
    }
    reviewContainerEl.append(gameReviewTitleEl);

    //display individual reveiws with author, critic score, date pub, quote
    var criticReviewContainer = $('<div>');
    var criticReviewData = reviewInfo.data.game_critic_reviews;
    criticReviewData.forEach(function(review){
      //author
      console.log(review);
      console.log(review.author);
      var authorEl = $('<p>').addClass('').text('Author: ' + review.author);
      criticReviewContainer.append(authorEl);      
      //critic score
      var criticScoreEl = $('<p>').addClass('').text('Score: score here');
      criticReviewContainer.append(criticScoreEl);  
      //date published
      var publishedEl = $('<p>').addClass('').text('Date Published: ' + review.date_published);
      criticReviewContainer.append(publishedEl);   
      //quote
      var quoteEl = $('<p>').addClass('').text('Quote: ' + review.qoute);
      criticReviewContainer.append(quoteEl); 
    })
    reviewContainerEl.append(criticReviewContainer);
  }
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
