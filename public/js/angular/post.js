(function(){
	var app = angular.module('postApp', []);

	app.controller('FormController', ['$http', function($http){
		var myApp = this;

		this.categories = [];

		this.subCategories = [];

		this.changeCateg = function(){
			
			this.subCategories = this.selectedCateg.sub_categories;
			
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