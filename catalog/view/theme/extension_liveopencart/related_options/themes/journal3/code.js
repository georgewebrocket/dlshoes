

function ro_setThemeCommonFunctions (ro_instance) {	
	
	ro_instance.common_fn.custom_displayResetOptions = function(){
		
    $().ready(function(){
      if ( ro_instance.getElement('#clear_options').length == 0 ) {
        if ( ro_instance.ro_settings.show_clear_options == 1 ) {
          ro_instance.getElement('.product-options .form-group:first').before('<div class="form-group"><a href="#" id="clear_options">'+ro_instance.ro_texts.text_ro_clear_options+'</a></div>');
        } else if ( ro_instance.ro_settings.show_clear_options == 2 ) { 
          ro_instance.getElement('.product-options .form-group:last').after('<div class="form-group"><a href="#" id="clear_options">'+ro_instance.ro_texts.text_ro_clear_options+'</a></div>');
        }
      }
    });
		
		return true;
	};
  
}


function ro_setThemeSpecificFunctions (ro_instance) {
  
	ro_instance.spec_fn.custom_radioToggle = function( $radio, option_value_disabled ){
		
		if ( $radio.closest('.push-option').length && $radio.siblings('span, img').length ) {
			$radio.next('span, img').toggle(!option_value_disabled);
			return true;
		}
	};
	
  ro_instance.spec_fn.additional_eventInitAfter = function(){

    $().ready(function(){
      setTimeout(function(){
        let selected_related_options = ro_instance.getSelectedRelatedOptions();
        ro_instance.each(selected_related_options, function(pov_id){
          if ( pov_id ) {
            ro_instance.controlAccessToValuesOfAllOptions();
            return false;
          }
        });
      }, 1);
    });
		
	};
	
	ro_instance.spec_fn.custom_displayStockWarning = function( alert_message ){
		
		if ( !alert_message ) {
			ro_instance.getElement('#ro_stock_alert').remove();
		} else {
			if ( ro_instance.getElement('#product-quantity').length ) {
				ro_instance.getElement('#product-quantity').closest('.cart-group').append('<div class="alert alert-warning" id="ro_stock_alert">' + alert_message + '<button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}
		}
	};
	
	ro_instance.spec_fn.additional_updateStockInfoAfter = function(stock, in_stock){

    ro_instance.getElement('#product_stock').closest('.product-stock').removeClass('in-stock, out-of-stock').addClass( in_stock ? 'in-stock' : 'out-of-stock' );
		
	};
	
}