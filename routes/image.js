var express = require('express');
var router = express.Router();

var easyimage = require('easyimage');

router.get("/", function(req, res){
	res.render("image",{
		csrfToken: req.csrfToken()
	});
});

router.post("/", function(req, res){
	var file = req.files.file;
	console.log(file);

	easyimage.info(file.path).then(
		
		function(file){
			console.log(file);
			res.send(file);
		}, function(err){
			console.log(err);
		}

	);

	// easyimage.resize({
	// 	src: file.path,
	// 	dst: "beach.png",
	// 	width: 300	
	// }).then(
	// 	function(file){
	// 		res.send(file);
	// 	}, function(err){
	// 		res.send(err);
	// 	}
	// );

});

module.exports = router;