
if ( !$('#poip_product_list_style_j3').length ) {
	$('head').append('<style id=""> .product-list div[data-poip_id=poip_img] { text-align: left; } .product-grid div[data-poip_id=poip_img] { text-align: center; } </style>');
}

poip_list.custom_methods['wrapThumbsHtml.instead'] = function(html) {
	return '<div data-poip_id="poip_img" style=" margin-top: 3px;">'+html+'</div>';
};

poip_list.custom_methods['changeProductImageByThumb.instead'] = function(thumb_elem) {
  
	let $thumb_elem = $(thumb_elem);
			
	if ( $thumb_elem.attr('data-poip-thumb') && $thumb_elem.attr('data-poip-product-index')) {
			
		let $main_img = $('img[data-poip-product-index="'+$thumb_elem.attr('data-poip-product-index')+'"]');
		let $second_img = $main_img.siblings('.img-second');
		
		if ( !$main_img.attr('data-poip-original-src') ) {
			$main_img.attr('data-poip-original-src', $main_img.attr('src'));
		}
		if ( !$main_img.attr('data-poip-original-srcset') ) {
			$main_img.attr('data-poip-original-srcset', $main_img.attr('srcset'));
		}
		$main_img.attr('src', $thumb_elem.attr('data-poip-thumb'));
		$main_img.removeAttr('srcset');
		
		if ( !$second_img.attr('data-poip-original-src') ) {
			$second_img.attr('data-poip-original-src', $second_img.attr('src'));
		}
		if ( !$second_img.attr('data-poip-original-srcset') ) {
			$second_img.attr('data-poip-original-srcset', $second_img.attr('srcset'));
		}
		$second_img.attr('src', $thumb_elem.attr('data-poip-thumb'));
		$second_img.removeAttr('srcset');
		
		$main_img.closest('a').attr('href', $thumb_elem.attr('href'));
			
	}
};

poip_list.custom_methods['eventThumbMouseOut.instead'] = function(thumb_elem) {
	
	if ( !poip_list.module_settings.img_category_click ) {
		let $thumb_elem = $(thumb_elem);
		if ( $thumb_elem.attr('data-poip-thumb') && $thumb_elem.attr('data-poip-product-index')) {
			let $main_img = $('img[data-poip-product-index="'+$thumb_elem.attr('data-poip-product-index')+'"]');
			let $second_img = $main_img.siblings('.img-second');
			
			if ( $main_img.attr('data-poip-original-src') ) {
				$main_img.attr('src', $main_img.attr('data-poip-original-src'));
			}
			if ( $second_img.attr('data-poip-original-src') ) {
				$second_img.attr('src', $second_img.attr('data-poip-original-src'));
			}
		}
	}
};


poip_list.custom_methods['displayThumbs.instead'] = function($product_anchor, html) {
	$product_anchor.closest('.product-thumb').find('.caption').prepend(html);
};


//poip_list.custom_methods['displayProductListImages.after'] = function(server_response) {
//	
//	let	products = server_response.products;
//  
//  
//  
//	
//	// add empty divs to make height of product blocks the same
//	
//	poip_common.each(products, function(product, product_id){
//		
//		var updated_product_ids = [];
//		$('img[data-poip-product-id="'+product_id+'"]').each( function(){
//			
//			if ( $.inArray(product_id, updated_product_ids) == -1 ) {
//			
//				var max_height = 0;
//				
//				//$container = $(this).closest('.carousel-product, .section-product, .main-products, .box-content').first();
//				//$container.find('[data-poip_id="poip_img"]').each(function(){
//				//	max_height = Math.max( max_height, $(this).height() );
//				//});
//				
//				if ( max_height ) {
//					$container.find('[data-poip-product-id]').each(function(){
//						if ( $(this).closest('.image').siblings('[data-poip_id="poip_img"]').length ) {
//							$(this).closest('.image').siblings('[data-poip_id="poip_img"]').css('height', ''+max_height+'px');
//						} else {
//							var html='<div data-poip_id="poip_img" style="z-index: 5; margin-top: 5px; position: relative; height: '+max_height+'px;"> </div>';
//              $(this).closest('.product-thumb').find('.caption .name').before(html);
//							//$(this).closest('.image').after(html);
//						}
//						updated_product_ids.push( $(this).attr('data-poip-product-id') );
//					});
//				}
//			}
//		});
//	});
//	
//		
//	// for the home page box of products (custom-sections) - refresh to increase height automatically to have enough place for option images
//	if ( typeof(Journal.equalHeight) == 'function' && $('div[data-poip_id="poip_img"]').closest('.box-content').length ) {
//		var $isotope = $('div[data-poip_id="poip_img"]').closest('.product-grid');
//		var $filter = $isotope.closest('.custom-sections').find('.box-heading a[data-option-value].selected');
//		Journal.equalHeight($isotope.find('.product-grid-item'), '[data-poip_id="poip_img"]');
//		if ( typeof($isotope.isotope) == 'function' && $filter.length ) {
//			$isotope.isotope({
//				filter: '.' + $filter.attr('data-option-value')
//			});
//		}
//	}
//
//}