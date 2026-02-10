
// execute immediately
//$('head').append( '<style id="poip_temp_page_loading_style">..product-image .additional-images { opacity: 0!important; }</style>' );


function setPoipProductCustomMethods(poip_product) {

	//poip_product.custom_methods.getImageElement = function(container_selector, image) {
	//	var $elem = poip_product.getElement(container_selector+' a[href="'+image+'"]:first');
	//	if ( !$elem.length ) {
	//		$elem = poip_product.getElement(container_selector+' a:first').clone();
	//		$elem.attr('href', image);
	//		$elem.find('img').attr('src', image);
	//	}
	//	return $elem;
	//};
	
	//poip_product.custom_methods.displayAdditionalImages = function() {
	//	$('#poip_temp_page_loading_style').remove();
	//};
  
	poip_product.custom_methods['init.after'] = function() {
	
		if ( !poip_product.main_image_default_href ) {
		  
			poip_product.main_image_default_src 	= poip_product.getElement('.product-image .main-image img').first().attr('src');
			poip_product.main_image_default_href  	= poip_product.main_image_default_src;
		}
	};
  
	poip_product.custom_methods.updateImageZoom = function() { // the code copied from catalog/view/theme/journal3/js/journal.js and modified to init zoom async
    // image zoom
		if (!('ontouchstart' in document)) {
			if (Journal['isPopup'] ? Journal['quickviewPageStyleCloudZoomStatus'] : Journal['productPageStyleCloudZoomStatus']) {
        
				let zoom_upd = function($this){
				  $this.ImageZoom({
					  type: Journal['isPopup'] ? Journal['quickviewPageStyleCloudZoomPosition'] : Journal['productPageStyleCloudZoomPosition'],
					  showDescription: false,
					  offset: [0, 0],
					  zoomSize: [$this.width(), $this.height()],
					  bigImageSrc: $this.data('largeimg')
					});
				};
				
				$('.main-image img').each(function (index) {
					var $this = $(this);
				  
					if ( index == 0 ) {
						zoom_upd($this);
					} else {
						setTimeout(function(){
							zoom_upd($this);
						}, 100);
					}
					//$this.ImageZoom({
					//	type: Journal['isPopup'] ? Journal['quickviewPageStyleCloudZoomPosition'] : Journal['productPageStyleCloudZoomPosition'],
					//	showDescription: false,
					//	offset: [0, 0],
					//	zoomSize: [$this.width(), $this.height()],
					//	bigImageSrc: $this.data('largeimg')
					//});
				});
			}
		}
	};
	
  
	poip_product.custom_methods['setVisibleImages.instead'] = function(images, counter, params) {
		
		poip_product.works.set_visible_images = true;
		
		clearTimeout(poip_product.timers.set_visible_images);
		if (!counter) counter = 1;
		if (counter == 10000) {
			poip_product.works.set_visible_images = false;
			return;
		}
		
		let slider_selector = '.product-image .main-image';
		let $slider_elem = poip_product.getElement(slider_selector);
			
		let carousel_selector = '.product-image .additional-images';
		let $carousel_elem = $(carousel_selector);
		let carousel_swiper = $carousel_elem.data('swiper');
		
		let poip_imgs = poip_product.getImagesBySrc(images, 'popup');
		let thumbs = poip_product.getSrcImagesBySrc('thumb', images, 'popup');
			
		if ( poip_product.images.length ) {	
			
			$carousel_elem.css('opacity', 0);
			
			let is_ready = true;
			if ( $slider_elem.length ) {
				is_ready = is_ready && $slider_elem.find('.swiper-wrapper').length && $slider_elem.data('swiper') && $slider_elem.data('swiper').initialized;
			}
			if ( carousel_swiper ) {
				is_ready = is_ready && $carousel_elem.find('.swiper-wrapper').length && $carousel_elem.data('swiper') && $carousel_elem.data('swiper').initialized && (($carousel_elem.find('.swiper-slide-visible').length && $carousel_elem.find('.swiper-slide-active').length) || $carousel_elem.find('img').length == 0 );
			}
		
			let $videos = $slider_elem.find('[data-ipvitem]').filter(function(){ return $(this).data('ipvitem') && $(this).data('ipvitem').ipv && $(this).data('ipvitem').ipv != 'false'; });
			if ( $videos.length ) {
				is_ready = is_ready && poip_product.getDocumentReadyState();
				//$videos.each(function(){
				//  is_ready = is_ready && $(this).find('[data-html]').length;
				//  if ( !is_ready ) {
				//    return false;
				//  }
				//});
			}
			
			let first_image_change_call = !poip_product.custom_data.set_visible_images_is_called;
		
			// always like first (journal3 slider takes time to be refreshed on sliders change on previous step)
			poip_product.custom_data.set_visible_images_is_called = false;
			
			//let update_main_product_image_swiper = true;
		
			if ( $slider_elem.length && !poip_product.theme_adaptation.updateShouldBeProcessed($slider_elem.find('img'), 'data-largeimg', images, images, counter, is_ready, true, params ) ) {
				return; // will the image updating by continued or not - set in the function
			} else {
				//update_main_product_image_swiper = false;
				if ( carousel_swiper && !poip_product.theme_adaptation.updateShouldBeProcessed($slider_elem.find('img'), 'src', thumbs, images, counter, is_ready, true, params ) ) {
					return; // will the image updating by continued or not - set in the function
				}
			}
			
			if ( !images.length && !poip_product.main_image_default_href ) {
				poip_product.works.set_visible_images = false;
				return;
			}
		
			if ( $slider_elem.length ) { // slider exists in on the product page and in the quickview
				
				poip_product.theme_adaptation.storeImageElementsToImageCollection({
					$images: $slider_elem.find('.swiper-slide:not(.swiper-slide-duplicate) img'), 
					attr_name: 'data-largeimg',
					parent_selector: '.swiper-slide',
					html_version: 'html_main',
					store_clone: true,
				});
			  
				if ( poip_product.works.j3_poip_min_height_update ) {
					clearTimeout( poip_product.works.j3_poip_min_height_update );
				}
			  
				if ( !poip_product.theme_adaptation.checkDisplayedImagesAreActual($slider_elem.find('img'), 'data-largeimg', images) ) {
			  
					if ( !$slider_elem.data('poip-min-height') ) {
					  $slider_elem.data('poip-min-height', $slider_elem.css('min-height'));
					}
					$slider_elem.css('min-height', $slider_elem.height());
					
					// update slider gallery used instead of the main image
					let slider_swiper = $slider_elem.data('swiper');
					//slider_swiper.removeAllSlides();
					
					let poip_imgs_main = poip_imgs.length ? poip_imgs : [poip_product.getImageBySrc(poip_product.main_image_default_src) || poip_product.getImageBySrc(poip_product.main_image_default_href)]; // in case of no images, use just the main image
					//let poip_imgs_main = poip_imgs.length ? poip_imgs : [{main: poip_product.main_image_default_src, popup: poip_product.main_image_default_href}]; // in case of no images, use just the main image
					
					let slides = [];
					
					let main_image_popup = (params && params.product_option_id) ? poip_product.getImageToDisplayAsMain(params.product_option_id, images) : false;
					
					poip_common.each(poip_imgs_main, function(poip_img, index){
					  
						let $clone = poip_img.html_clone.html_main;
						$clone.attr('data-index', index);
						
						if ( !first_image_change_call && ( !main_image_popup || main_image_popup != images[0] ) ) {
						//if ( !poip_product.$container.closest('html').is('.phone') && !first_image_change_call ) {
							if ( !poip_product.elementIsVideo( $clone ) ) {
								$clone.find('img').hide(); // style="display:none;" to show images only after setting the main (if the complete list of images was updated, the first image may be displayed for a moment)
							} else {
								$clone.find('.ipv-journal3').hide();
							}
						}
						slides.push($clone.clone(true, true)[0]); // to do not loose the iproductvideo events on the element
					  
					});
					
					// fix for reversed order in arabic
					$slider_elem.find('.swiper-container .swiper-wrapper').attr('dir', 'ltr');
					slider_swiper.rtlTranslate = false;
					
					//if ( update_main_product_image_swiper ) {
					slider_swiper.removeAllSlides();
					slider_swiper.appendSlide(slides);
					//}
					
					
					poip_product.custom_methods.updateImageZoom();
					
					poip_product.works.j3_poip_min_height_update = setTimeout(function(){
						clearTimeout( poip_product.works.j3_poip_min_height_update );
						$slider_elem.css('min-height', $slider_elem.data('poip-min-height'));
						$slider_elem.removeData('poip-min-height');
					}, 100);
				}
			}
		
			if ( carousel_swiper ) { // carousel
				
				poip_product.theme_adaptation.storeImageElementsToImageCollection({
					$images: $carousel_elem.find('.swiper-slide:not(.swiper-slide-duplicate) img'), // style="display:none;" to show images only after setting the main (if the complete list of images was updated, the first image may be displayed for a moment)
					parent_selector: '.swiper-slide',
					html_version: 'html_add',
					store_clone: true,
				});
				
				carousel_swiper.removeAllSlides();
				
				let slides_additional = [];
				poip_common.each(poip_imgs, function(poip_img, index){
				  
					let title = poip_img.title || poip_product.default_image_title;
				  
					let $clone = poip_img.html_clone.html_add;
					$clone.attr('data-index', index);
					$clone.find('img').attr('title', title);
					slides_additional.push($clone.clone(true,true)[0]);
				  
				});
				
				carousel_swiper.appendSlide(slides_additional);
					  
				$(window).on('load', function(){ // on load to fix the issue with j3 looking on the height of not yet loadad main image
					carousel_swiper.$el.trigger('resize'); // j3 control the slider container height on resize
				});
				
			} else if ($carousel_elem.find('.additional-image img').length) { // simple list of images
				
				poip_product.theme_adaptation.storeImageElementsToImageCollection({
					$images: $carousel_elem.find('.additional-image img'), // style="display:none;" to show images only after setting the main (if the complete list of images was updated, the first image may be displayed for a moment)
					parent_selector: '.additional-image',
					html_version: 'html_add',
					store_clone: true,
				});
				
				$carousel_elem.html('');
				//let html = '';
				poip_common.each(poip_imgs, function(poip_img, index){
					let title = poip_img.title || poip_product.default_image_title;
					
					let $clone = poip_img.html_clone.html_add;
					$clone.attr('data-index', index);
					$clone.find('img').attr('title', title);
					$clone.find('img').attr('alt', title);
					$carousel_elem.append( $clone.clone(true,true) );
					//html+='<div class="additional-image" data-index="'+index+'">';
					//html+='<img src="'+poip_img.thumb+'" title="'+title+'" alt="'+title+'">';
					//html+='</div>';
				});
				//$carousel_elem.html(html);
				
			}
		}
		// trick to give swiper some more time to finish refreshing
		poip_product.timers.set_visible_images = setTimeout(function(){
			$carousel_elem.css('opacity', 1);
			poip_product.works.set_visible_images = false;
		});
    
		
	};
  
	poip_product.custom_methods['updatePopupImages.instead'] = function() {
    
		let popup_images = [];
		poip_product.getElement('.product-image .main-image [data-gallery]').each(function(){
			let $img = $(this).find('img');
			
			if ( !$img.closest('.swiper-slide-duplicate').length ) {
			
				let image = $img.attr('data-largeimg');
				let poip_img = poip_product.getImageBySrc(image);
				if ( poip_img ) {
					let lg_item = {
						src: image,
						thumb: poip_img.thumb,
					};
					if ( $img.attr('data-html') ) {
						lg_item.html = $img.attr('data-html');
						delete lg_item.src;
						lg_item.poster = $img.attr('src');
					}
					popup_images.push(lg_item);
				}
			}
		});
		
		//$('.lightgallery-product-images').data('images', popup_images);
		$('.lightgallery-product-images').attr('data-images', JSON.stringify(popup_images));
		$('.lightgallery-product-images').replaceWith( poip_common.getOuterHTML($('.lightgallery-product-images')) );
	};
  
	poip_product.custom_methods['setMainImage.instead'] = function(image){
		
		let poip_img = poip_product.getImageBySrc(image);
		
		let image_swiper = poip_product.getElement('.product-image .main-image').data('swiper');
		let index = poip_product.getElement('.product-image .main-image img[data-largeimg="'+poip_img.popup+'"]').closest('[data-index]').attr('data-index');
		if ( typeof(index) == 'undefined' ) {
			index = poip_product.getElement('.product-image .additional-images img[src="'+poip_img.thumb+'"]').closest('[data-index]').attr('data-index');
		}
		
		if (typeof(index)!='undefined') {
			//setTimeout(function(){
			//  image_swiper.slideTo(index, 0);
			//});  
			image_swiper.slideTo(index, 0);
		}
	};
  
	// show images only after setting the main (if the complete list of images was updated, the first image may be displayed for a moment)
	poip_product.custom_methods.showSlides = function(){
		
		poip_product.getElement('.product-image .main-image .swiper-slide').each(function(){
			if ( poip_product.elementIsVideo($(this)) ) {
				$(this).find('.ipv-journal3').show();
			} else {
				$(this).find('img[data-largeimg]').show();
			}
		});
		$('#poip_temp_page_loading_style').remove();
		
	};
  
	poip_product.custom_methods['updateMainImage.after'] = function(){
		// show images only after setting the main (if the complete list of images was updated, the first image may be displayed for a moment)
		poip_product.custom_methods.showSlides();
		//poip_product.getElement('.product-image .main-image img[data-largeimg]').show();
	};
  
	poip_product.custom_methods['initActionWithNoOptionImages.after'] = function(){
		// show images not only after setting the main but initially too (if there is no option images)
		poip_product.custom_methods.showSlides();
		//poip_product.getElement('.product-image .main-image img[data-largeimg]').show();
	};
  
  
  
	poip_product.custom_methods['updateImageAdditionalMouseOver.instead'] = function(){
		if ( poip_product.module_settings.img_hover ) {
			poip_product.getElement('.product-image .additional-images img').off('mouseover');
			poip_product.getElement('.product-image .additional-images img').on('mouseover', function(e){
				poip_product.eventAdditionalImageMouseover(e, $(this));
			});
		}
	};
  
	poip_product.custom_methods['setDefaultOptionValues.instead'] = function(pov_ids){
		$().ready(function(){
			poip_common.each(pov_ids, function(pov_id){
				poip_product.setProductOptionValue(pov_id);
			});
		});
	};
	
	poip_product.custom_methods['updateContainerOfImagesBelowOptions.instead'] = function(product_option_id, $option_element, html) {
		$option_element.closest('[id^="input-option"]').append('<div id="option-images-'+product_option_id+'" style="margin-top: 10px;display: block; width: 100%;">'+html+'</div>');
	};
	
	//poip_product.custom_methods['getAdditionalImagesBlock.instead'] = function(){
	//	return poip_product.getElement(".additional-images");
	//};
  
	poip_product.custom_methods['addInitialVideosToImages.after'] = function(){
		
		// videos should be linked with all possible option values
		let po_ids = poip_product.getPOIdsHavingImages();
		let pov_ids = poip_product.getPOVIdsHavingImages();
					
		
		poip_product.getElement('.product-image .main-image').find('[data-ipvitem]').each(function(index){
		  
			let $elem = $(this);
			
			if ( $elem.is('a') ) { // ":not(a)" because they was checked in the basic module function
				return;
			}
			
			if ( poip_product.elementIsVideo($elem) ) {
			  
				let $img = $elem.find('img');
				
				let $img_additional = $('.product-image .additional-images').find('[data-index="'+($elem.attr('data-index')||index)+'"] img').first();
				
				poip_product.images.splice($elem.index(), 0, {
					is_video: true,
					image: $img.attr('data-largeimg'),
					popup: $img.attr('data-largeimg'),
					main: $img.attr('src'),
					thumb: $img_additional.attr('src'),
					sort_order: $elem.index(),
					product_option_id: po_ids.slice(0),
					product_option_value_id: pov_ids.slice(0),
				});
			}
		});
    
	};
	
	//poip_product.custom_methods['setMainImage.instead'] = function(image){
	//	
	//	var $additional_image = poip_product.getElement('#product-gallery a[href="'+image+'"]:first');
	//	
	//	var index = poip_product.getElement('#product-gallery a').index( $additional_image );
	//	var thumb = poip_product.getElement('#product-gallery a').find('img').attr('src');
	//	
	//	Journal.changeProductImage(thumb, image, index);
	//	
	//	if ( $('div.zm-viewer').length) {
	//		
	//		var poip_img = poip_product.getImageBySrc(image, 'popup');
	//		if ( poip_img ) {
	//			poip_product.getElement('#image').data('imagezoom').changeImage(poip_img.popup, poip_img.popup);
	//		}
	//	}
	//};
	//
	//
	//poip_product.custom_methods['setProductOptionValue.after'] = function(value){
	//	
	//	if (poip_product.getElement('.option ul li[data-value='+value+']').length) {
	//		poip_product.getElement('.option ul li[data-value='+value+']').click();
	//		return;
	//	}
	//};
	
}