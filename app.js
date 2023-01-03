const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let db = null;
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error is ${error}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
const ConvertMovieDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `SELECT movie_name FROM movie;`;
  const movieArray = await db.all(getMoviesListQuery);
  response.send(movieArray.map((eachMovie) => ConvertMovieDbAPI1(eachMovie)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 3

const ConvertMovieDb = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieDetailsQuery);
  response.send(ConvertMovieDb(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directorResponse = await db.all(getDirectorsQuery);
  response.send(
    directorResponse.map((eachItem) => convertDirectorDbAPI6(eachItem))
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const getMoviesByDirectorResponse = await db.all(getMoviesByDirectorQuery);
  response.send(getMoviesByDirectorResponse);
});

module.exports = app;
