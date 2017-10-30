const express = require('express');
const request = require('request');
const router  = express.Router();

router.get('/tracks/:queryTerm', (req, res, next) => {
  var query = req.params.queryTerm;
  request(
    'https://api.spotify.com/v1/search?query='+ query +'&offset=0&limit=20&type='+ type +'&market=US',

    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var dataFromSpotify = JSON.parse(body);
        res.send(dataFromSpotify['tracks']);
      } else {
        console.log(error);
      }
    }
  )
});

module.exports = router;
