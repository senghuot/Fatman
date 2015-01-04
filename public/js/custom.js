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

})(jQuery);