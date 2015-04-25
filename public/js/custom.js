(function($) {

	// prettyPhoto
	// jQuery(document).ready(function(){

	// 	jQuery('a[data-gal]').each(function() {
	// 		jQuery(this).attr('rel', jQuery(this).data('gal'));
	// 	});  	
	// 	jQuery("a[data-rel^='prettyPhoto']").prettyPhoto({animationSpeed:'slow',theme:'light_square',slideshow:false,overlay_gallery: false,social_tools:false,deeplinking:false});
	// });

  $('img.small-img').hover(function(){
    var src = $(this).attr('srcLarge');
    var position = $(this).attr("position");

    $('.large-img').attr('src', src);
    $('.large-img').attr('position', position);
  });

  $("div.large-img-container").hover(function(){
    $(this).css({"cursor" : "pointer"});
  });

  $("div.large-img-container").click(function(){
    var $position = $('.large-img').attr('position');
    $(".fancybox").eq($position).trigger('click');
  });

  $(".fancybox").fancybox({
    nextEffect: "fade",
    prevEffect: "fade",
    padding: 0
  });

  //convert string to uppercase first letter. ex: "hello world" => "Hello World"
  String.prototype.capitalize = function(){
    return this.replace( /(^|\s)([a-z])/g , 
      function(m,p1,p2){ 
        return p1+p2.toUpperCase();
      } );
  };
  //***************************************************

  // Searching for posts
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
  //***************************************************

  // click more button to get more content
  var skip = 1;

  $("button#more").click(function(){

    $("button#more").html("Loading...");
    // allowInfiniteScroll = true;
    // $(this).hide();
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
      url: "/api/v1/search",
      type: "GET",
      dataType: "JSON",
      data: data,
      contentType: "application/json; charset=UTF-8"
    });
    
    request.done(function(data){

      var divResult = $("div#container");

      for (var i = 0; i < data.length; i++){
        var result = "<div class='post'>";
        result += "<div class='post-wrapper'>";
          result += "<a href='/display/" + data[i]._id + "'>";
            result += "<img src='" + data[i].pictures[0] + "' />";
          result += "</a>";
          result += "<div class='title'>" + data[i].title + "</div>";
          result += "<div class='price'>$" + data[i].price + "</div>";
          result += "<div class='location'>" + data[i].location.city.capitalize() + "</div>";
          result += "<div class='user'>" + data[i].user.fname.capitalize() + "</div>";
        result += "</div>";
        result += "</div>";


        divResult.append(result);
        divResult.masonry().imagesLoaded(function(){
          divResult.masonry("reloadItems").masonry("layout");
        });
      }

      $("button#more").html("More");
      if (data.length === 0){
        $("button#more").html("No More Post!");
      }
    });

    request.fail(function(jqXHR, textStatus){
      alert("Request failed: " + textStatus);
      $("button#more").html("Loading Fail!");
    });
  });
  
  //************************************************************************************
  // hide/show navbar
  // $("div.navbar-fixed-top").autoHidingNavbar();

  var didScroll;

  // on scroll, let the interval function know the user has scrolled
  $(window).scroll(function(event){
    didScroll = true;
  });

  // run hasScrolled() and reset disScroll status
  setInterval(function(){
    if (didScroll){
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  var lastScrollTop = 0;
  var delta = 5;
  var navbarHeight = $("div.navbar-fixed-top").outerHeight();
  function hasScrolled(){
    var st = $(this).scrollTop();
    if (Math.abs(lastScrollTop - st) <= delta)
      return;
    // if current position > last position and scrolled past navbar
    if (st > lastScrollTop && st > navbarHeight){
      // alert('scolldown');
      $("div.navbar-fixed-top").removeClass('nav-down').addClass('nav-up');
    }else{
      // scroll up
      // if did not scroll past the document (possible on mac)
      if ((st + $(window).height()) < $(document).height()){
        // alert("scrollup");
        $('div.navbar-fixed-top').removeClass('nav-up').addClass('nav-down');
      }
    }

    lastScrollTop = st;
  }

  //************************************************************************************

  //************************************************************************************
  // delete image
  $('span#x').click(function(){
    var deletedImage = $(this).parent();

    var $image = $(this).attr("img-loc");

    var data = {};
    data.image = $image.substring($image.lastIndexOf("_") + 1, $image.lastIndexOf("."));
    
    // set csrf token otherwise it will return 403
    var csrf = $("input#csrf").val();
    $.ajaxPrefilter(function(options, _, xhr){
      xhr.setRequestHeader('X-CSRF-Token', csrf);
    });

    var url = "/api/v1/images/" + $("input#postId").val();

    var request = $.ajax({
      url: url,
      type: "put",
      dataType: "JSON",
      data: JSON.stringify(data),
      contentType: "application/json; charset=UTF-8"
    });

    request.done(function(data, status){
      console.log(data);
      console.log(status);
      deletedImage.remove();
    });

    request.fail(function(data){
      alert(data.status);
    });
  });

  //************************************************************************************
  
  // // load more content when scroll to bottom page
  // function lastAddedLiveFunc() {
  //   $('div#lastPostsLoader').html('loading');

  //   var myForm = $('form#search');
  //   var location = $("select#location");
  //   var keyword = $("input#keyword");
  //   var category = $("input#category");
  //   var sort = $("input#sort");

  //   var data = {};
  //   data.location = location.val();
  //   data.keyword = keyword.val();
  //   data.category = category.val();
  //   data.sort = sort.val();
  //   data.skip = skip++;

  //   var request = $.ajax({
  //     url: "http://localhost:3000/api/v1/search",
  //     type: "GET",
  //     dataType: "JSON",
  //     data: data,
  //     contentType: "application/json; charset=UTF-8"
  //   });

  //   request.done(function(data){
  //     var divResult = $("div#container");
  //     console.log(data);

  //     if (data == '') loadStatus = false;

  //     for (var i = 0; i < data.length; i++){
  //       var result = "<div class='post'>";
  //       result += "<div class='post-wrapper'>";
  //         result += "<a href='/display/" + data[i]._id + "'>";
  //           result += "<img src='" + data[i].pictures[0] + "' />";
  //         result += "</a>";
  //         result += "<div class='title'>" + data[i].title + "</div>";
  //         result += "<div class='price'>$" + data[i].price + "</div>";
  //         result += "<div class='location'>" + data[i].location.city + "</div>";
  //         result += "<div class='user'>" + data[i].user.fname + "</div>";
  //       result += "</div>";
  //       result += "</div>";


  //       divResult.append(result);
  //       divResult.masonry().imagesLoaded(function(){
  //         divResult.masonry("reloadItems").masonry("layout");
  //       });
  //     }

  //     $('div#lastPostsLoader').empty();
  //   });

  //   request.fail(function(jqXHR, textStatus){
  //     alert("Request failed: " + textStatus);
  //   });
  // };

  // //lastAddedLiveFunc();
  // $(window).scroll(function(){

  //     var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
  //     var  scrolltrigger = 0.5;

  //     if  ((wintop/(docheight-winheight)) > scrolltrigger && loadStatus && allowInfiniteScroll) {
  //      //console.log('scroll bottom');
  //      lastAddedLiveFunc();
  //     }
  // });
//******************************************************************
  // initialize masonry
  var $container = $("div#container");

  // layout Masonry again after all images have loaded
  $container.imagesLoaded(function(){
    $container.masonry({
      columnWidth: 300,
      itemSelector: ".post",
      isFitWidth: true,
      gutter: 10,
      isAnimated: true
    });
  });
})(jQuery);