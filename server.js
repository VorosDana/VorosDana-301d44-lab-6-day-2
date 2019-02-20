'use strict';

require('dotenv').config();
const cors = require('cors');



const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const superagent = require('superagent');
app.use(cors());



app.get('/location', (request, response) => {
  // const locationData = searchToLatLong(request.query.data);
  // response.send(locationData);

  // Sam's lecture example
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => errorHandler(error, response));
});

app.get('/weather', (request, response) => {
  const weatherData = getWeather(request.query.data);
  response.send(weatherData);
});

app.use('*', (request, response) => {
  errorHandler('route not found', response);
});

function searchToLatLong(query) {
  // let geo = require('./data/geo.json');


  // Sam's lecture example
  const url = `https://maps.googleapis.com/map/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(result => {
      return new Location(query, result)}).catch(error => errorHandler)
}

function getWeather(location) {
  const darkSkyData = require('./data/darksky.json');
  // let weatherSummaries = [];

  let weatherSummaries = darkSkyData.daily.data.map(day => {
    return new Weather(day);
  })
  return weatherSummaries;
}

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function errorHandler(err, res) {
  console.error(err);
  if (res) {
    res.status(500).send('sorry it all exploded');
  }
}

//TODO:
// well want some error handling;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));