var express = require('express');
var router = express.Router();
var request = require('request');
var http = require('http');

var dockerizedMosesIP = fs.readFileSync('WinCompatibleMoses/docker-ip.txt','utf8').replace(/[\n\r]+/g, '');

module.exports = function() {

    /* GET home page. */
	app.get('/', function(req, res) {

		res.render('pages/home');
	});
    
    app.post('/CorpusPreparation', function(req, res) {

        //var data = querystring.stringify(req.body);
        var data = "source_lang="+req.body.src_lang
                    +"&target_lang="+req.body.trg_lang
                    +"&LM_name="+req.body.LM_name
                    +"&LM="+req.body.LM
                    +"&TM_source="+req.body.TM_source
                    +"&TM_target="+req.body.TM_target

        var options = {
            host: dockerizedMosesIP,
            port: 5000,
            path: '/PrepareCorpus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        var final_result = '';
        var moses_api_request = http.request(options, function(moses_response) {
            moses_response.setEncoding('utf8');
            moses_response.on('data', function (chunk) {
                final_result += chunk;
            });
            moses_response.on('end', function () {
                  res.json(final_result);
            });
        });
        moses_api_request.on('error', function(err) {
                //res.send('error: ' + err.message);
                console.log('error: ' + err.message);
            });
        moses_api_request.write(data);
        moses_api_request.end();
    });

    app.post('/Translate', function(req, res) {
        console.log(req.body);
        request({
          uri: dockerizedMosesIP+":5000/Translate/" + req.body['TranslationInput'],
          method: "GET",
        }, function(error, response, body) {
          if (error){
            res.json(JSON.stringify(error));
          }
          else{
            res.json(body);
          }
        });


    });

    app.post('/Train', function(req, res) {
        console.log(req.body);
        request({
          uri: "http://"+dockerizedMosesIP+":5000/Train",
          method: "GET",
        }, function(error, response, body) {
          if (error){
            res.json(JSON.stringify(error));
          }
          else{
            res.json(body);
          }
        });


    });

}
