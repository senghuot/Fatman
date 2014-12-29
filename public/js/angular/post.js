(function(){
	var app = angular.module('postApp', []);

	app.controller('FormController', ['$http', function($http){
		var myApp = this;
		this.test = "test angular";
		this.load = "loaded complet.";

		this.categories = [];

		this.subCategories = [];

		this.viewSubCateg = [];


		this.changeCateg = function(){
			this.viewSubCateg = [];
			for (var i = 0; i < this.subCategories.length; i++){
				if (this.selectedCateg._id === this.subCategories[i].category_id)
					this.viewSubCateg.push(this.subCategories[i]);
			}
			this.selectedSubCateg = this.viewSubCateg[0];
		}

		//load category and sub_category from database
		$http.get("http://localhost:3000/categories").
			success(function(data, status, headers, config){

				myApp.categories	 = data.sort(function(a, b){
					if (a.type < b.type) return -1;
					if (a.type > b.type) return 1;
					return 0;
				});
				myApp.selectedCateg = data[0];

				$http.get("http://localhost:3000/categories/sub_categories").
					success(function(subData, status, headers, config){

						myApp.subCategories = subData.sort(function(a, b){
							if (a.type < b.type) return -1;
							if (a.type > b.type) return 1;
							return 0;
						});

						for (var i = 0; i < myApp.subCategories.length; i++){
							
							if (myApp.selectedCateg._id === myApp.subCategories[i].category_id)
								myApp.viewSubCateg.push(myApp.subCategories[i]);
						}

						myApp.selectedSubCateg = myApp.viewSubCateg[0];

					}).
					error(function(data, status, headers, config){
						alert(data);
					});
			}).
			error(function(data, status, headers, config){
				alert(data);
			});
	}]);
})();