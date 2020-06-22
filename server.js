require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
const POKEDEX = require("./pokedex.json");
const cors = require("cors");
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const bearerToken = req.get("Auth");
  const apiKey = process.env.API_TOKEN;

  if (!bearerToken || bearerToken.split(" ")[1] !== apiKey) {
    return res.status(401).json({ error: "unauthorized request" });
  }

  next();
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const validTypes = [
  `Bug`,
  `Dark`,
  `Dragon`,
  `Electric`,
  `Fairy`,
  `Fighting`,
  `Fire`,
  `Flying`,
  `Ghost`,
  `Grass`,
  `Ground`,
  `Ice`,
  `Normal`,
  `Poison`,
  `Psychic`,
  `Rock`,
  `Steel`,
  `Water`,
];

function handleGetPokemon(req, res) {
  const name = req.query.name;
  let getType = req.query.type;
  const typeLetter = getType.slice(0, 1).toUpperCase();
  const type = getType.replace(getType[0], typeLetter);
  if (!validTypes.find((t) => type === t)) {
    return res.status(401).json({ error: "type not found" });
  }
  const pokemonType = POKEDEX.pokemon.filter((record) => {
    const types = record.type.filter((t) => {
      return t === type;
    });
    return types[0] === type;
  });

  const pokemon = POKEDEX.pokemon.find((record) => record.name === name);

  res.send(pokemonType);
}

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get("/pokemon", handleGetPokemon);

app.get("/types", handleGetTypes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
