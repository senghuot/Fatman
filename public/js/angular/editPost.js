(function(){
	var app = angular.module('editPostApp', []);

	app.controller('FormController', ['$http', function($http){
		var myApp = this;

		this.invalid = false;

		this.categories = [];

		this.subCategories = [];

		this.photos = [];
		this.photosGT12 = false;
		this.photosNeed = false;

		this.changeCateg = function(){
			
			this.subCategories = this.selectedCateg.sub_categories;
			
		}

		this.fileSize = function(){
			if (typeof FileReader !== 'undefined'){
				var files = document.getElementById('photos').files;
				for (var i = 0; i < files.length; i++){
					alert(files[i].name);
				}
			}
		}

		this.submit = function(event){
			this.invalid = true;

			if (typeof FileReader !== 'undefined'){
				this.photos = [];
				var files = document.getElementById('photos').files;
				
				// No image is selected; need at least one image
				if (files.length === 0 && this.currentTotalPhotos == 0){
					this.photosNeed = true;
					this.photosGT12 = false;
					event.preventDefault();
				// Images' are greater than 12
				}else if (files.length + this.currentTotalPhotos > 12){
					this.photosGT12 = true;
					this.photosNeed= false;
					event.preventDefault();
				}else{
					this.photosNeed = false;
					this.photosGT12 = false;
					for (var i = 0; i < files.length; i++){
						if (files[i].size > 1*1024*1024*5){
							this.photos.push(files[i]);
						}
							
					}

					// Some images' size are greater than 5 MB
					if (this.photos.length > 0)
						event.preventDefault();
				}
			}
		}

		this.deleteImage = function(){
			alert("Current Total Photos: " + --this.currentTotalPhotos);
		}

		//load category and sub_category from database
		$http.get("http://localhost:3000/categories").
			success(function(data, status, headers, config){

				myApp.categories	 = data.sort(function(a, b){
					if (a.type < b.type) return -1;
					if (a.type > b.type) return 1;
					return 0;
				});

				for (var i = 0; i < myApp.categories.length; i++){
					if (myApp.categories[i]._id == myApp.oldCategory){
						myApp.selectedCateg = myApp.categories[i];		
						myApp.subCategories = myApp.selectedCateg.sub_categories;
					}
				}
				 
				for (var i = 0; i < myApp.subCategories.length; i++){
					if (myApp.subCategories[i]._id == myApp.oldSubCategory){
						myApp.selectedSubCateg = myApp.subCategories[i];
					}
				}

				alert("Current Total Photos: " + myApp.currentTotalPhotos);
			}).
			error(function(data, status, headers, config){
				alert(data);
			});
	}]);
})();