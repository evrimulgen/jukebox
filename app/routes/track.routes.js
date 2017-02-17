var express = require('express');
var router = express.Router();
var keys = require.main.require('./config/keys');
var spotify = require.main.require('./app/services/spotify');
var google = require('googleapis');
var youtube = google.youtube('v3');
var ytdl = require('ytdl-core');

router.get('/search', function(req, res) {

	spotify.searchTracks(req.query.q).then(function(data) {
		return res.status(200).json(data);
	}).catch(function(err) {
		console.log(err);
		return res.status(400).json(err);
	});

});

router.get('/mp3', function(req, res) {

	youtube.search.list({
		part: 'snippet',
		q: req.query.artist + ' - ' + req.query.track,
		auth: keys.google.apiKey,
		maxResults: 1,
		type: 'video'
	}, function(err, data) {
		if (err) return res.status(err.statusCode).json(err);

		var videoId = data.items[0].id.videoId;
		
		var url = 'https://www.youtube.com/watch?v='+videoId;

		var video = ytdl(url, {
			filter: 'audioonly'
		});
		
		res.writeHead(200, {
			'Content-Type': 'audio/mpeg',
			'Accept-Ranges': 'bytes',
			'Transfer-Encoding': 'chunked',
			'Content-Disposition': 'inline; filename="' + req.query.track + ' - ' + req.query.artist + '.mp3"'
		});
		
		video.on('end', function(data) {
			console.log(data);
		});
		
		video.pipe(res);
	});
});

module.exports = router;