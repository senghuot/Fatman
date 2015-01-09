var express = require('express');
var router = express.Router();

var easyimage = require('easyimage');

router.get("/", function(req, res){
	res.render("image",{
		csrfToken: req.csrfToken()
	});
});

router.post("/", function(req, res){
	var files = req.files.file;
	// console.log(files);

	// convert to jpg extenstion to have smallest file size possible
	// easyimage.info(file.path).then(
		
	// 	function(mFile){
	// 		easyimage.resize({
	// 			src: file.path,
	// 			dst: "beach.jpg",
	// 			width: 300,
	// 			quality: 0.1	
	// 		}).then(	
	// 			function(rFile){
	// 				res.send(rFile);
	// 			}, function(err){
	// 				res.send(err);
	// 			}
	// 		);
	// 	}, function(err){
	// 		console.log(err);
	// 		res.send(err);
	// 	}

	// );

	var photos = [];
	if (Object.prototype.toString.call(files) === '[object Array]')
		photos = files;
	else
		photos.push(files);

	for (var i = 0; i < photos.length; i++){
		easyimage.info(photos[i].path).then(
			function(photo){
				console.log(photo);
			}, function(err){
				console.log(err);
			}
		);
	}

	res.send("ok");
});

module.exports = router;