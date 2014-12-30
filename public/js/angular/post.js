(function(){
	var app = angular.module('postApp', []);

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
				
				if (files.length === 0){
					this.photosNeed = true;
					this.photosGT12 = false;
					event.preventDefault();
				}else if (files.length > 12){
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

					if (this.photos.length > 0)
						event.preventDefault();
				}
			}
		}

		//load category and sub_category from database
		$http.get("http://localhost:3000/categories").
			success(function(data, status, headers, config){

				myApp.categories	 = data.sort(function(a, b){
					if (a.type < b.type) return -1;
					if (a.type > b.type) return 1;
					return 0;
				});
			}).
			error(function(data, status, headers, config){
				alert(data);
			});
	}]);
})();