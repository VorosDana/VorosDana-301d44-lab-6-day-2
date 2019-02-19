'use strict';

require('dotenv').config();
const cors = require('cors');



const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());



app.get('/location', (request, response) => {
  const locationData = searchToLatLong(request.query.data);
  response.send(locationData);
})

app.get('/weather', (request, response) => {
  const weatherData = getWeather(request.query.data);


app.use('*', (request, response)=>{
  errorHandler('route not found', response);
})

  response.send(weatherData);
})

function searchToLatLong(place) {
  let geo = require('./data/geo.json');
  const location = new Location(place, geo);
  return location;
}

function getWeather(location) {
  const darkSkyData = require('./data/darksky.json');
  let weatherSummaries = [];

  darkSkyData.daily.data.forEach(day => {
    weatherSummaries.push(new Weather(day));
  })
  return weatherSummaries;
}

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

function errorHandler (err, res) {
  console.error(err);
  if (res){
    res.status(500).send('sorry it all exploded');
  }
}

//TODO:
// well want some error handling;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));