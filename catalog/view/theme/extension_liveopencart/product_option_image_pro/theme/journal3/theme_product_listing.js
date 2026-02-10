

function poip_product_listing_setPoipProductCustomMethods(poip_product) {
	
  
	poip_product.custom_methods['setVisibleImages.instead'] = function(images, counter, params) {
    
		poip_product.works.set_visible_images = true;
		
		clearTimeout(poip_product.timers.set_visible_images);
		if (!counter) counter = 1;
		if (counter == 10000) {
			poip_product.works.set_visible_images = false;
			return;
		}
		
		let poip_imgs = poip_product.getImagesBySrc(images);
		
		if ( poip_imgs.length ) {
			let poip_img_first = poip_imgs[0];
			let poip_img_second = poip_imgs[1] || poip_img_first;
			
			let $img_first = poip_product.getElement('.product-img img:first');
			let $img_second = poip_product.getElement('.product-img img:eq(1)');
			
			$img_first.attr('src', poip_img_first.main);
			$img_first.attr('data-src', poip_img_first.main);
			$img_first.attr('srcset', poip_img_first.main+' 1x, '+poip_img_first.popup+' 2x');
			$img_first.attr('data-srcset', poip_img_first.main+' 1x, '+poip_img_first.popup+' 2x');
			
			if ( $img_second.length ) {
				
				$img_second.attr('src', poip_img_second.main);
				$img_second.attr('data-src', poip_img_second.main);
				$img_second.attr('srcset', poip_img_second.main+' 1x, '+poip_img_second.popup+' 2x');
				$img_second.attr('data-srcset', poip_img_second.main+' 1x, '+poip_img_second.popup+' 2x');
			}
			
			//$img_first.attr('src', poip_img_first.main);
			//$img_first.attr('data-src', poip_img_first.main);
			//$img_first.attr('srcset', poip_img_first.main+' 1x, '+poip_img_first.popup+' 2x');
			//$img_first.attr('data-srcset', poip_img_first.main+' 1x, '+poip_img_first.popup+' 2x');
			//
			//if ( $img_second.length ) {
			//	
			//	$img_second.attr('src', poip_img_second.main);
			//	$img_second.attr('data-src', poip_img_second.main);
			//	$img_second.attr('srcset', poip_img_second.main+' 1x, '+poip_img_second.popup+' 2x');
			//	$img_second.attr('data-srcset', poip_img_second.main+' 1x, '+poip_img_second.popup+' 2x');
			//}
			
		}
		
		poip_product.works.set_visible_images = false;
		
		
	};
  
	poip_product.custom_methods['updatePopupImages.instead'] = function() {
	  
  
	};
	
	poip_product.custom_methods['setMainImage.instead'] = function(image){
	  
	};
	
	
	poip_product.custom_methods['updateImageAdditionalMouseOver.instead'] = function(){
  
	};
	
	poip_product.custom_methods['updateContainerOfImagesBelowOptions.instead'] = function(product_option_id, $option_element, html) {
  
	};
	  
	poip_product.custom_methods['addInitialVideosToImages.after'] = function(){

	};
	
	
}



