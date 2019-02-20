'use strict';

require('dotenv').config();
const cors = require('cors');



const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const superagent = require('superagent');
app.use(cors());



app.get('/location', (request, response) => {

  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => errorHandler(error, response));
});

app.get('/weather', (request, response) => {
  getWeather(request.query.data, response);
});

app.get('/meetups', (request, response) => {
  getMeetups(request.query.data, response);
});

app.use('*', (request, response) => {
  errorHandler('route not found', response);
});

function searchToLatLong(query) {
  // let geo = require('./data/geo.json');


  // Sam's lecture example
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  console.log(url);

  return superagent.get(url)
    .then(result => {
      return new Location(query, result)
    }).catch(error => errorHandler)
}

function getWeather(location, response) {

  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${location.latitude},${location.longitude}`;
  // const url = `https://api.darksky.net/forecast/ffd2665ffae3fbbd75e69166d496fc13/42.3601,-71.0589`;
  //              https://api.darksky.net/forecast/ffd2665ffae3fbbd75e69166d496fc13/-122.3320708,47.6062095

  superagent.get(url).then(result => {
    const weatherSummary = result.body.daily.data.map(day => {
      return new Weather(day);
    })
    console.log(weatherSummary);
    response.send(weatherSummary);
  }).then((result) => console.log(result))
    .catch(error => errorHandler);


  // const darkSkyData = superagent.get(url);

  // let weatherSummaries = darkSkyData.daily.data.map(day => {
  //   return new Weather(day);
  // })
  // return weatherSummaries;
}

function getMeetups(req, res) {
  const url = `https://api.meetup.com/find/upcoming_events?sign=true&photo-host=public&lon=${req.longitude}&page=20&lat=${req.latitude}&key=${process.env.MEEETUP_API_KEY}`;
  console.log(url);
  superagent.get(url).then(result => {
    const meetups = result.body.events.map(event => new Meetup(event));
    res.send(meetups);
  })


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

function Meetup(event) {
  this.link = event.link;
  this.name = event.name;
  this.creation_date = new Date(event.created* 1000).toString.slice(0, 15);
  this.host = event.venue.name;
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