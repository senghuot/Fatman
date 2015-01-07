(function($) {

	// prettyPhoto
	jQuery(document).ready(function(){

		jQuery('a[data-gal]').each(function() {
			jQuery(this).attr('rel', jQuery(this).data('gal'));
		});  	
		jQuery("a[data-rel^='prettyPhoto']").prettyPhoto({animationSpeed:'slow',theme:'light_square',slideshow:false,overlay_gallery: false,social_tools:false,deeplinking:false});
	});

  $('img.small-img').hover(function(){
    var src = $(this).attr('src');
    $('.large-img').attr('src', src);
  });

  $('.small-imgs').magnificPopup({
    delegate: 'a',
    type: 'image',
    gallery: {
      enabled: true
    }
  });

  var skip = 1;
  
  // search button
  $('select#selectCategory').change(function(){
    var category = $('select#selectCategory');
    var hiddenCategory = $('input#category');

    hiddenCategory.val(category.val());
    var myForm = $('form#search');
    myForm.submit();
  });

  $('select#selectSort').change(function() {
    var sort = $('select#selectSort');
    var hiddenSort = $('input#sort');

    hiddenSort.val(sort.val());
    var myForm = $('form#search');
    myForm.submit();
  });

  // click more button to more content
  $("button#more").click(function(){
    var myForm = $('form#search');
    var location = $("select#location");
    var keyword = $("input#keyword");
    var category = $("input#category");
    var sort = $("input#sort");

    var data = {};
    data.location = location.val();
    data.keyword = keyword.val();
    data.category = category.val();
    data.sort = sort.val();
    data.skip = skip++;

    var request = $.ajax({
      url: "http://localhost:3000/api/v1/search",
      type: "GET",
      dataType: "JSON",
      data: data,
      contentType: "application/json; charset=UTF-8"
    });

    request.done(function(data){
      var divResult = $("div#container");
      console.log(data);

      for (var i = 0; i < data.length; i++){
        var result = "<div class='post'>";
        result += "<div class='post-wrapper'>";
          result += "<a href='/display/" + data[i]._id + "'>";
            result += "<img src='" + data[i].pictures[0] + "' />";
          result += "</a>";
          result += "<div class='title'>" + data[i].title + "</div>";
          result += "<div class='price'>$" + data[i].price + "</div>";
          result += "<div class='location'>" + data[i].location.city + "</div>";
          result += "<div class='user'>" + data[i].user.fname + "</div>";
        result += "</div>";
        result += "</div>";


        divResult.append(result);
        divResult.masonry().imagesLoaded(function(){
          divResult.masonry("reloadItems").masonry("layout");
        });
      }
    });

    request.fail(function(jqXHR, textStatus){
      alert("Request failed: " + textStatus);
    });
  });

})(jQuery);