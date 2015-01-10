var express = require('express');
var router = express.Router();

var easyimage = require('easyimage');

var Photo = require('./../models/photo');

router.get("/", function(req, res){
	res.render("image",{
		csrfToken: req.csrfToken()
	});
});

router.post("/", function(req, res){
	var files = req.files.file;
	// console.log(files);

	// convert to jpg extenstion to have smallest file size possible
	// easyimage.info(files.path).then(
		
	// 	function(mFile){
	// 		easyimage.resize({
	// 			src: files.path,
	// 			dst: "public/uploads/posts/small/beach.jpg",
	// 			width: 300	
	// 		}).then(	
	// 			function(rFile){
	// 				console.log(rFile)
	// 			}, function(err){
	// 				console.log(rFile);
	// 			}
	// 		);
	// 		easyimage.resize({
	// 			src: files.path,
	// 			dst: "public/uploads/posts/large/beach.jpg",
	// 			width: 800
	// 		}).then(
	// 			function(rFile){
	// 				console.log(rFile)
	// 				res.send(rFile)
	// 			}, function(err){
	// 				res.send(err)
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

	var photo = new Photo();
	photo.save(function(err){
		if (err) console.log(err);
		else{
			for (var i = 0; i < photos.length; i++){
				var dst = photo._id + "_" + i + ".jpg";
				photo.path.push(dst);
				easyimage.convert({
					src: photos[i].path,
					dst: dst
				}).then(
					function(file){
						
					}, function(err){
						console.log(err);
					}
				);
			}
			
			photo.save();

			res.send("ok");
		}
	});

	function test(){
		console.log("hello world!");
	}
});

module.exports = router;