// LIVEOPENCART: Related Options

(function ($) { $.fn.liveopencart_RelatedOptions = function(p_params){
	
	$this = this;

	var inst = {
		
		each : function(collection, fn){
			for ( var i_item in collection ) {
				if ( !collection.hasOwnProperty(i_item) ) continue;
				if ( fn(collection[i_item], i_item) === false ) {
					return;
				}
			}
		},

		getSetting : function(p_setting_name, p_default) {
			if ( typeof(inst.ro_settings[p_setting_name]) != 'undefined' ) {
				if ( inst.ro_settings[p_setting_name] !== '0' ) {
					return inst.ro_settings[p_setting_name];
				} else {
					return 0;
				}
			} else {
				return p_default;
			}
		},
		
		bind : function(trigger_name, event_function) {
			inst.parentBlock.on(trigger_name, event_function);
		},
		trigger : function(trigger_name, values) {
			inst.getBlockOfOptions().trigger(trigger_name, values);
		},
		
		initSpecFunctions: function(){
			if (inst.theme_methods && inst.theme_methods.spec_fn)  {
				ro_common.proxyObjectMethods(inst.spec_fn, !'debug', inst.theme_methods.spec_fn);
			}
		},
		
		initCommonFunctions: function(){
			if (inst.theme_methods && inst.theme_methods.common_fn)  {
				ro_common.proxyObjectMethods(inst.common_fn, !'debug', inst.theme_methods.common_fn);
			}
		},
		
		initRO : function(ro_init_cnt) {
			
			if ( !inst.ro_data || inst.ro_data == {} || inst.ro_data == [] ) {
				return; // no related options
			}
			
			// add specifically displayed options (quantity input/select per option value)
			inst.getOptionElement('[data-quantity-per-option][data-product-option-id]').each(function(){
				var product_option_id = $(this).attr('data-product-option-id');
				if ( $.inArray(product_option_id, inst.ro_product_options) !=-1 ) {
					inst.input_quantity_per_options.push( product_option_id );
				}
			});
			
			// assign for global variable
			inst.options_step_by_step = inst.getOptionsAsStepsFromHTML();
			
			if ( !inst.options_step_by_step.length && !ro_init_cnt ) {
				// in some themes page options may be not available on this stage, so recall init on document.ready
				$().ready( function() {
					inst.initRO(1);
				});
				return;
			}
			
			
			inst.each(inst.options_step_by_step, function(option_step){ // we need all options, even not visible on this action
				inst.all_values_of_options[option_step] = inst.getAllValuesOfProductOption(option_step);
			});
			
			inst.each(inst.ro_data, function(ro_dt){
				inst.each(ro_dt.ro, function(ro_comb){
					inst.each(ro_dt.options_ids, function(po_id){
						let pov_id = ro_comb.options[po_id];
						if ( pov_id || inst.getSetting('allow_empty')) {
							if ( !inst.all_values_of_options[po_id] ) {
								inst.all_values_of_options[po_id] = [];
							}
							inst.all_values_of_options[po_id].push(pov_id);
						}
					});
				});
			});
		
			inst.getOptionElement('select[name^="'+inst.option_prefix+'"]').change(function(){
				inst.controlAccessToValuesOfAllOptions();
			});
			
			inst.getOptionElement('input[type=radio][name^="'+inst.option_prefix+'"]').change(function(){
				inst.controlAccessToValuesOfAllOptions();
			});
			
			inst.controlAccessToValuesOfAllOptions();
			
			$().ready( function() {
			
				if ( typeof(inst.ros_to_select) != 'undefined' && inst.ros_to_select && inst.ros_to_select.length) {
					let ro_id_last = false;
					if ( !inst.poip_ov ) {
					
						inst.each(inst.ros_to_select, function(ro_id){
							ro_id_last = ro_id;
							inst.setSelectedCombination(ro_id, true); // without limitaions
						});
						if (ro_id_last) {
							inst.setSelectedCombination(ro_id_last); /// with limitations
						}
					}
					
				} else {
			
					inst.setSelectedCombinationByModel(inst.filter_name);
					inst.controlAccessToValuesOfAllOptions();
					
					inst.initialAutoSelect();
					
				}
			
			});
			
			inst.trigger('init_after.ro');
			
		},
		
		getOptionsAsSteps : function() {
			
			let steps = [];
			inst.each(inst.options_step_by_step, function(product_option_id){
				// skip options hidden by pcop
				if ( typeof(pcop_front) != 'undefined' && typeof(pcop_front.getHiddenOptions) == 'function' ) {
					if ( $.inArray(product_option_id, pcop_front.getHiddenOptions()) == -1 ) {
						steps.push(product_option_id);
					}
				} else {
					steps.push(product_option_id);
				}
				
			});
			
			return steps;
		},
		
		getQuantityInput : function() {
			return inst.getElement('#input-quantity, input[name="quantity"]');
		},
		
		setOptionValue : function(product_option_id, product_option_value_id) {
			
			var $touched_elems = '';
			if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]').length > 0) {
				
				$touched_elems = inst.getOptionElement('[name="'+inst.option_prefix+'['+product_option_id+']"]').val(product_option_value_id);
				
			} else if ( inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]').length > 0) {
				var radio_elems = inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]');
				radio_elems.prop('checked', false);
				
				if ( product_option_value_id ) {
					var radio_elem = inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"][value='+product_option_value_id+']');
					radio_elem.prop('checked', true);
				}
				
				$touched_elems = radio_elems;
			}
			
			inst.trigger('setOptionValue_after.ro', [product_option_id, product_option_value_id, $touched_elems]);
			
			// Product Option Image PRO compatibility
			if ( typeof(poipExternalOptionChange)=='function' ) {
				poipExternalOptionChange();
			}
			if ( typeof(poip_product)!='undefined' && typeof(poip_product.externalOptionChange) == 'function' ) {
				poip_product.externalOptionChange();
			}
			
		},
		
		getBlockOfOptions : function() {
			return inst.parentBlock;
		},
		
		getOptionElement : function(selector) {
			return inst.getBlockOfOptions().find(selector);
		},
		
		getProductOptionIdFromName : function(name) {
			return name.substr(inst.option_prefix_length+1, name.indexOf(']')-(inst.option_prefix_length+1) );
		},
		
		getElement : function(selector) {
			return inst.parentBlock.find(selector);
		},
		
		getContainer : function() {
			return inst.parentBlock;
		},
    
		getValuesOfSelectOption : function(param_product_option_id) {
			if ( $.isEmptyObject(inst.all_select_ov) ) {
				inst.getOptionElement('select[name^="'+inst.option_prefix+'["]').each( function (si, sel_elem) {
					var product_option_id = inst.getProductOptionIdFromName(sel_elem.name);
					
					inst.all_select_ov[product_option_id] = [];
					
					$.each(sel_elem.options, function (oi, op_elem) {
						inst.all_select_ov[product_option_id].push(op_elem.value);
					});
					
				} );
			}
			return inst.all_select_ov[param_product_option_id];
		},
		
		getSelectedROCombsByOptions : function(options_values){
			return inst.getROIdsByOptions(options_values, true);
		},
		
		getROIdsByOptions : function(options_values, strict) {
			let ro_ids = [];
			let ro_combs = inst.getROCombsByOptions(options_values, strict);
			inst.each(ro_combs, function(ro_comb){
				ro_ids.push(ro_comb.relatedoptions_id);
			});
			return ro_ids;
		},
		
		getCurrentROCombs : function(strict){
			let selected_option_values = inst.getOptionValues([]);
			return inst.getROCombsByOptions(selected_option_values, strict);
		},
		
		getROCombsByOptions : function(options_values, strict) {
			let ro_combs = [];
			inst.each(inst.ro_data, function(ro_dt){
		
				let all_ok;
				inst.each(ro_dt.ro, function(ro_comb){
					
					all_ok = true;
					inst.each(ro_comb.options, function(pov_id, product_option_id){
						
						all_ok = all_ok && ((product_option_id in options_values && options_values[product_option_id]==pov_id) || (!strict && !options_values[product_option_id] ) );
					});
					if (all_ok) ro_combs.push(ro_comb); 
				});
			});
			return ro_combs;
		},
		
		arrayIntersection : function(arr1, arr2) {
			var new_arr = [];
			for (let i in arr1) {
				if ( arr1.hasOwnProperty(i) ) {
					if ($.inArray(arr1[i], arr2) != -1) {
						new_arr.push(arr1[i]);
					}
				}
			}
			return new_arr;
		},
		
		arrayCopy : function(arr) {
			var new_arr = [];
			for (let i in arr) {
				if ( arr.hasOwnProperty(i) ) {
					if ( $.isArray(arr[i]) ) {
						new_arr[i] = inst.arrayCopy(arr[i]);
					} else {
						new_arr[i] = arr[i];
					}
				}
			}
			return new_arr;
		},
		
		getAllValuesOfProductOption : function(product_option_id) {
			var values = [];
			if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]').length) {
				var select_options = inst.getValuesOfSelectOption(product_option_id);
				inst.each(select_options, function(select_option){
					if (select_option) {
						values.push(select_option);
					}
				});
			} else if ( inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+product_option_id+']"]').length) {
				inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+product_option_id+']"]').each(function(){
					values.push($(this).val());
				});
			}
			// add specifically displayed options (quantity input/select per option value)
			if ( $.inArray(product_option_id, inst.input_quantity_per_options) != -1 ) {
				$('[name^="quantity_per_option['+product_option_id+']["]').each(function(){
					var product_option_value_id = $(this).attr('data-value');
					if ( product_option_value_id ) {
						values.push(product_option_value_id);
					}
				});	
			}
			return values;
		},
		
		getOptionsWithDirectRelations : function(prodict_option_id) {
		
			if ( inst.linked_options_cache[prodict_option_id] ) {
				return inst.linked_options_cache[prodict_option_id];
			} else {
		
				var linked_options = [];
				inst.each(inst.ro_data, function(ro_dt){
					if ( $.inArray(prodict_option_id, ro_dt.options_ids)!=-1 ) {
						inst.each(ro_dt.options_ids, function(current_option_id){
							if ( current_option_id != prodict_option_id && $.inArray(current_option_id, linked_options) ) {
								linked_options.push(current_option_id);
							}
						});
					}
				});
				inst.linked_options_cache[prodict_option_id] = linked_options;
				return linked_options;
			}
		},
		
		// get available options values
		// option_id - (product_option_id)
		// param_options_values - current options values (selected) - only for related options
		// param_skip_ropv_ids - don't make values addition for this related options combinations
		getAccessibleOptionValues : function(option_id, param_options_values, param_skip_options) {
			
			// make copies od arrays
			let options_values = inst.arrayCopy(param_options_values);
			let skip_options = inst.arrayCopy(param_skip_options);
			skip_options.push(option_id);
			
			let linked_options = inst.getOptionsWithDirectRelations(option_id);
			
			inst.each(linked_options, function(current_option_id){
				if ( options_values[current_option_id] && !options_values[current_option_id].length && current_option_id != option_id) {
					if ( $.inArray(current_option_id, skip_options) == -1 ) {
						options_values[current_option_id] = inst.getAccessibleOptionValues(current_option_id, options_values, skip_options);
					}
				}
			});
			
			let common_accessible_values = false;
			
			let possible_current_option_values = inst.arrayCopy(inst.all_values_of_options[option_id]);
			
			
			inst.each(inst.ro_data, function(ro_dt){
			
				if ($.inArray(option_id, ro_dt.options_ids)==-1) {
					return;
				}
				
				let accessible_values = [];
				let ro_combs = ro_dt.ro;
				
				let options_for_check = []; // optimization
				inst.each(options_values, function(values, current_po_id){
					if (current_po_id != option_id && values.length && $.inArray(current_po_id, skip_options) == -1 && $.inArray(current_po_id, ro_dt.options_ids)!=-1) {
						options_for_check.push(current_po_id);
					}
				});
				
				if (!options_for_check.length) {
					
					if (ro_dt.options_ids.length == 1) { // combination contains only one option (this option)
						inst.each(ro_combs, function(ro_comb){
							let ro_comb_pov_id = ro_comb.options[option_id];
							if ( ro_comb_pov_id && $.inArray(ro_comb_pov_id, accessible_values) == -1 ) {
								accessible_values.push(ro_comb_pov_id);
							}
						});
					} else {
						accessible_values = inst.arrayCopy(possible_current_option_values);
					}
				} else {
					inst.each(ro_combs, function(ro_comb){
						
						let all_ok = true;
						inst.each(options_for_check, function(current_po_id){
							let current_pov_id = ro_comb.options[current_po_id];
							
							if ( $.inArray(current_pov_id, options_values[current_po_id]) == -1 || (!inst.getSetting('allow_empty') && typeof(current_pov_id) == 'undefined') ) {
								all_ok = false;
							}
							
							if (!all_ok) {
								return false;
							}
						});
						
						
						
						if (all_ok && ($.inArray(ro_comb.options[option_id], accessible_values) == -1 )) {
							
							accessible_values.push(ro_comb.options[option_id]);
							if (possible_current_option_values.length == accessible_values.length) { // optimization
								
								return false;
							}
						}
					});
				}
				
				if (common_accessible_values === false) {
					common_accessible_values = accessible_values;
				} else {
					common_accessible_values = inst.arrayIntersection(common_accessible_values, accessible_values);
				}
			});
			
			return common_accessible_values;
		},
		
		// only for options with values
		// returns array of accessible values
		controlAccessToValuesOfOption : function(param_options_values, option_id) {
			
			var options_values = [];
			inst.each(param_options_values, function(product_option_value_id, product_option_id){
				
				options_values[product_option_id] = [];
				if (product_option_value_id || typeof(product_option_value_id) == 'undefined' ) { // for normally selected value or for not selected options in step-by-step mode
					options_values[product_option_id].push(product_option_value_id);
				}
			});
			var skip_ropv_ids = [];
			var accessible_values = inst.getAccessibleOptionValues(option_id, options_values, skip_ropv_ids);
			
			inst.setAccessibleOptionValues(option_id, accessible_values);
			
			return accessible_values;
		},
		
		toggleOptionElement : function(option_id, toggle_flag) {
			inst.getOptionElement('#input-option'+option_id).parent().toggle(toggle_flag); 
			if ( inst.getOptionElement('#input-option'+option_id).parent().is('div.select') && inst.getOptionElement('#input-option'+option_id).parent().parent().is('div.form-group') ) { // additional compatibility (fastor theme or custom modification)
				inst.getOptionElement('#input-option'+option_id).parent().parent().toggle(toggle_flag);
			}
			inst.getOptionElement('label[for="input-option'+option_id+'"]').toggle(toggle_flag);
		},
		
		optionIsAccessible : function(option_id) {
			if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').length) {
				return inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"] option[value][value!=""]:not(:disabled)').length ? true : false;
			} else if ( inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]').length) {
				return inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]:not(:disabled)').length ? true : false;
			} else if ( inst.getOptionElement('input[name^="quantity_per_option['+option_id+']["]').length) {
				return inst.getOptionElement('input[name^="quantity_per_option['+option_id+']["]:not(:disabled)').length ? true : false;
			}
		},
		
		hideInaccessibleOptionIfNeeded : function(option_id) {
			if (inst.ro_settings && inst.ro_settings.hide_option) {
				inst.toggleOptionElement(option_id, inst.optionIsAccessible(option_id));
			}
		},
		
		makeInaccessibleOptionsNotRequired : function(option_id) {
			if (inst.ro_settings && inst.ro_settings.unavailable_not_required) {
				var current_ids = [];
				if ($('#ro_not_required').length) {
					current_ids = $('#ro_not_required').val().split(',');
				} else {
					$('#product').append('<input type="hidden" name="ro_not_required" id="ro_not_required" value="">');
				}
				var new_ids = [];
				inst.each(current_ids, function(current_id){
					if (current_id != option_id) {
						new_ids.push(current_id);
					}
				});
				if (!inst.optionIsAccessible(option_id)) {
					new_ids.push(option_id);
				}
				$('#ro_not_required').val( new_ids.toString());
			}
		},
		
		setAccessibleOptionValues : function(option_id, accessible_values) {
			
			var current_value = ( inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]:checked').val() || inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').val());
		
			if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').length) {
				
				if ( current_value && $.inArray(current_value, accessible_values)==-1 ) {
					inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').val('');
					inst.accessibility_check_restart_needed = true;
				} else {
					// .find('option').filter(function(){return $(this).prop('selected'); }) for cases when option value selected by external .prop('selected');
					let $so_selected_by_prop = inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"] option[value!=""]').filter(function(){return $(this).prop('selected'); });
					if (!current_value && $so_selected_by_prop.length ) {
						$so_selected_by_prop.prop('selected', false);
						inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').val('');
						inst.accessibility_check_restart_needed = true;
					}
				}
				
				if (inst.hide_inaccessible) {
				
					let select_options = inst.getValuesOfSelectOption(option_id);
					inst.each(select_options, function(select_option){
						if (select_option) {
							option_value_disabled = ($.inArray(select_option,accessible_values) == -1);
							// hiding options for IE
							inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]').toggleOption(select_option, !option_value_disabled);
							inst.trigger( 'setAccessibleOptionValues_selectToggle_after.ro', [option_id, select_option, option_value_disabled] );
						}
					});
					
				} else {
				
					let select_options = inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_id+']"]')[0].options;
					inst.each(select_options, function(select_option){
						if (select_option.value) {
							option_value_disabled = ($.inArray(select_option.value,accessible_values) == -1);
							select_option.disabled = option_value_disabled;
							if (option_value_disabled) {
								$(select_option).addClass('ro_option_disabled');
							} else {
								$(select_option).removeClass('ro_option_disabled');
							}
							inst.trigger( 'setAccessibleOptionValues_selectEnableDisable_after.ro', [option_id, select_option.value, option_value_disabled] );
						}
					});
				}
				
				inst.trigger( 'setAccessibleOptionValues_select_after.ro', [option_id, accessible_values] );
				
			} else if ( inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]').length) {	
				
				if (current_value && $.inArray(current_value, accessible_values)==-1) {
				
					var elem_to_uncheck = inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]:checked');
					
					if ( elem_to_uncheck.length ) {
						inst.setOptionValue(option_id, '');
						//elem_to_uncheck.prop('checked', false);
						inst.accessibility_check_restart_needed = true;
					}
					
					inst.trigger( 'setAccessibleOptionValues_radioUncheck_after.ro', [elem_to_uncheck] );
				}
				
				$radio_options = inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_id+']"]');
				$radio_options.each(function(){
					let $radio_option = $(this);
					
					option_value_disabled = ($.inArray($radio_option.val(), accessible_values) == -1);
					
					$radio_option.prop('disabled', option_value_disabled); // hidden should be disabled too
					
					if (inst.hide_inaccessible) {
					
						inst.toggleOptionValueRadio($radio_option, option_value_disabled);
						inst.trigger( 'setAccessibleOptionValues_radioToggle_after.ro', [ option_id, $radio_option, option_value_disabled ] );
						
					} else {
						
						if ( typeof(inst.custom_radioEnableDisable) != 'undefined' && inst.custom_radioEnableDisable( $radio_option, option_value_disabled ) ) {
							// do nothing
						} else {
							
							if (option_value_disabled) {
								inst.fadeToOptionRadio($radio_option, 0.1);
							} else {
								inst.fadeToOptionRadio($radio_option, 1);
							}
							
						}
						
						inst.trigger( 'setAccessibleOptionValues_radioEnableDisable_after.ro', [ option_id, $radio_option, option_value_disabled ] );
						
					}
				//}
				});
				
			} else if ( $.inArray(option_id, inst.input_quantity_per_options) != -1 ) { // for specifically displayed options (quantity input/select per option value)
				
				inst.getOptionElement('[name^="quantity_per_option['+option_id+']["]').each(function(){
					var $qpo_input = $(this);
					var product_option_value_id = qpo_getPOVIdByName( $qpo_input.attr('name') );
					if ( product_option_value_id ) {
						option_value_disabled = ( $.inArray(product_option_value_id, accessible_values) == -1 );
						if ( option_value_disabled ) {
							$qpo_input.val('');
						} else if ( $qpo_input.prop('disabled') ) { // re-enable the input - place default values
							$qpo_input.val( $qpo_input.attr('data-default-value' || '0') );
						}
						$qpo_input.prop('disabled', option_value_disabled);
						var $option_value_container = $qpo_input.closest('tr');
						if ( !$option_value_container.length ) {
							$option_value_container = $qpo_input.closest('div');
						}
						if (inst.hide_inaccessible) {
							$option_value_container.toggle(!option_value_disabled);
						} else {
							if ( option_value_disabled ) {
								inst.fadeToForElement($option_value_container, 0.1);
							} else {
								inst.fadeToForElement($option_value_container, 1);
							}
						}
					}
				});
				
			}
			
			inst.hideInaccessibleOptionIfNeeded(option_id);
			inst.makeInaccessibleOptionsNotRequired(option_id);
		},
		
		toggleOptionValueRadio: function($radio, option_value_disabled) {
			
			if ( typeof(inst.custom_radioToggle) != 'undefined' && inst.custom_radioToggle( $radio, option_value_disabled ) ) {
				// do nothing
			} else {
				$radio.parent().parent().toggle(!option_value_disabled);
				$radio.toggle(!option_value_disabled);
			}
			
			// style change for padding change
			if (option_value_disabled) {
				if ($radio.parent().parent().hasClass('radio')) {
					$radio.parent().parent().removeClass('radio');
					$radio.parent().parent().addClass('_radio_ro');
				}
			} else {
				if ($radio.parent().parent().hasClass('_radio_ro')) {
					$radio.parent().parent().removeClass('_radio_ro');
					$radio.parent().parent().addClass('radio');
				}
			}
			
			
		},
		
		getSelectedOptionValue: function(po_id) {
			let $elem = inst.getOptionElement('select[name="'+inst.option_prefix+'['+po_id+']"], input[type=radio][name="'+inst.option_prefix+'['+po_id+']"]:checked');
			if ( $elem.length && $elem.val() ) {
				return $elem.val();
			}
		},
		
		getOptionValues : function() {
			
			var options_values = {};
		
			inst.getOptionElement('select[name^="'+inst.option_prefix+'["], input[type=radio][name^="'+inst.option_prefix+'["]').each(function(){
				option_id = inst.getProductOptionIdFromName( $(this).attr('name') );
				
				if ($.inArray(option_id,inst.ro_product_options) != -1) {
					
					if ( typeof(options_values[option_id]) == 'undefined' ) {
						options_values[option_id] = 0;
					}
					
					if ( $(this).find('option[value]').length ) { // select
						options_values[option_id] = $(this).val();
					} else { // radio
						if ( $(this).is(':checked') ) {
							options_values[option_id] = $(this).val();
						}
					}
					
				}
			});
			
			// add specifically displayed options (quantity input/select per option value)
			inst.each(inst.input_quantity_per_options, function(product_option_id){
				options_values[product_option_id] = 0;
			});
			
			return options_values;
		},
    
		getSelectedRelatedOptions : function(){
			let related_options = inst.getOptionValues();
			let selected_related_options = {};
			inst.each(related_options, function(pov_id, po_id){
				if (pov_id) {
					selected_related_options[po_id] = pov_id;
				}
			});
			return selected_related_options;
		},
		
		setSelectedCombination : function(ro_id, skip_access) {
			
			let options_to_set = {};
			if (inst.ro_data) {
				inst.each(inst.ro_data, function(ro_dt){
					if (ro_dt.ro[ro_id]) {
						
						inst.each(ro_dt.ro[ro_id].options, function(pov_id, po_id){
							options_to_set[po_id] = pov_id;
						});
						
						return false;
					}
				});
			}

			if ( !$.isEmptyObject(options_to_set) ) { // we should set option values in the order of options on the page (to make it working with the step-by-step mode)
				inst.each(inst.getOptionsAsSteps(), function(po_id){
					if ( options_to_set[po_id] ) {
						inst.setOptionValue(po_id, options_to_set[po_id]);
						if ( inst.step_by_step && inst.hide_inaccessible ) { // control access, otherwise next option may do not have values to make selected at all
							inst.controlAccessToValuesOfAllOptions();
						}
					}
				});
			}
		
			// access should be checked also for step by step because there may be selects with removed options
			if ( typeof(skip_access) == 'undefined' || !skip_access || (inst.step_by_step && inst.hide_inaccessible) ) { 
	
				inst.controlAccessToValuesOfAllOptions();
				
				inst.trigger('setSelectedCombination_withAccessControl_after.ro');
				
			}
			
			inst.executeFunctionsFromOtherExtensionsOnOptionChange();
		},
		
		executeFunctionsFromOtherExtensionsOnOptionChange : function() {
			
			// Parent-child options - compatibility
			if ( typeof(pcop_front) != 'undefined' && typeof(pcop_front.checkVisibility) == 'function' ) {
				pcop_front.checkVisibility();
			}
			
			// very old Product Option Image PRO compatibility
			if ( typeof(poipExternalOptionChange)=='function' ) {
				poipExternalOptionChange();
			}
			// old Product Option Image PRO compatibility
			if ( typeof(poip_product)!='undefined' && typeof(poip_product.externalOptionChange) == 'function' ) {
				poip_product.externalOptionChange();
			}
			
			if ( typeof(poip_common)!='undefined' && poip_common && typeof(poip_common.externalOptionChangeEvent) == 'function' ) {
				poip_common.externalOptionChangeEvent( inst.getBlockOfOptions() );
			}
			
			// Live Price OLD
			if ( typeof(liveprice_recalc) == 'function' ) {
				liveprice_recalc(100);
			}
			
			// Live Price NEW
			if ( window.liveopencart && window.liveopencart.live_price_instances ) {
				var lp_instances = window.liveopencart.live_price_instances;
				if ( Array.isArray(lp_instances) && lp_instances.length ) {
					inst.each(lp_instances, function(lp_instance){
						lp_instance.updatePrice(100);
					});
				}
			}
			
			$(document).trigger('external_option_change'); // io supported
		},
		
		setSelectedCombinationByModel : function(model) {
			if (model && inst.ro_data) {
				inst.each(inst.ro_data, function(ro_dt){
					inst.each(ro_dt.ro, function(ro_comb, ro_id){
						if (ro_comb.model && ro_comb.model.toLowerCase() == model.toLowerCase()) {
							ro_set_selected_combination(ro_id);
							return true;
						}
					});
				});
			}
			return false;
		},
		
		// for step-by-step way
		getOptionsAsStepsFromHTML : function() {
			var options_steps = [];
			
			inst.getOptionElement('input[name^="'+inst.option_prefix+'["], select[name^="'+inst.option_prefix+'["]').each(function(){
			
				let product_option_id = inst.getProductOptionIdFromName( inst.getOptionElement(this).attr('name'));
				
				if ($.inArray(product_option_id, inst.ro_product_options) != -1) {
					if ($.inArray(product_option_id, options_steps) == -1) {
						options_steps.push(product_option_id);
					}
				}
				
			});
			
			// add specifically displayed options (quantity input/select per option value)
			inst.each(inst.input_quantity_per_options, function(product_option_id){
				options_steps.push(product_option_id);
			});
			
			return options_steps;
		},
		
		controlAccessToValuesOfAllOptions : function() {
		
			if (!inst.ro_data || !Object.keys(inst.ro_data).length) return;
			
			inst.accessibility_check_restart_needed = false;
			
			if (inst.step_by_step) {
				
				var prev_options_values = {};
				var prev_options = [];
				var option_accessible_values = [];
				var one_prev_value_is_not_set = false;
				
				inst.each(inst.getOptionsAsSteps(), function(option_step_po_id, i){
				
					if (i>0) {
						// if previous option value is selected or if previous option has no available values
						//if (!one_prev_value_is_not_set) {
							// limitaion on previous
							option_accessible_values = inst.controlAccessToValuesOfOption(prev_options_values, option_step_po_id);
							
						//} else {
						//	// disable all
						//	inst.setAccessibleOptionValues(option_step_po_id, []);
						//	option_accessible_values = [];
						//}
					}
					
					
					prev_options.push(inst.getSelectedOptionValue(option_step_po_id));
					//prev_options.push( ( inst.getOptionElement('input[type=radio][name="'+inst.option_prefix+'['+option_step_po_id+']"]:checked').val() || inst.getOptionElement('select[name="'+inst.option_prefix+'['+option_step_po_id+']"]').val()) );
					prev_options_values[option_step_po_id] = prev_options[prev_options.length-1];
					
					if ((option_accessible_values.length || i==0) && !prev_options[i] ) { // option has available values, but none of them is selected
						one_prev_value_is_not_set = true;
					}
					
					if ( inst.accessibility_check_restart_needed ) {
						inst.controlAccessToValuesOfAllOptions();
						return;
					}
					
				});
			
			} else {
				
				var options_values = inst.getOptionValues();
				var options_keys = Object.keys(options_values);
				
				//if ( inst.getSetting('allow_empty') ) {
				//	inst.each(options_keys, function(option_key){
				//		if ( options_keys )
				//	});
				//}
				
				//let selected_related_options = inst.getSelectedRelatedOptions();
				
				inst.each(options_keys, function(option_key){
					
					inst.controlAccessToValuesOfOption(options_values, option_key);
					
					if ( inst.accessibility_check_restart_needed ) {
						inst.controlAccessToValuesOfAllOptions();
						return false;
					}
				});
				
			}
			
			inst.controlOutOfStockOptionViewAll();
			
			inst.checkAutoSelect();
			
			inst.trigger('controlAccessToValuesOfAllOptions_after.ro');
			
		},
		
		controlOutOfStockOptionViewAll : function() {
			if ( inst.ro_settings.allow_zero_select && inst.ro_settings.fade_out_of_stock_option_values ) {
				
				let po_ids = inst.getOptionsAsSteps();
				let selected_option_values = inst.getOptionValues([]);
				
				if ( inst.ro_settings.fade_out_of_stock_option_values == 1 ) {
					
					inst.each(po_ids, function(po_id){
						
						inst.controlOutOfStockOptionViewOneOption(po_id, selected_option_values);
						
					});
				} else if ( inst.ro_settings.fade_out_of_stock_option_values == 2 ) {
					if ( po_ids.length ) {
						inst.controlOutOfStockOptionViewOneOption(po_ids[po_ids.length-1], selected_option_values);
					}
				}
			}
		},
		
		controlOutOfStockOptionViewOneOption : function(po_id, selected_option_values) {
			
			if ( inst.ro_settings.allow_zero_select && inst.ro_settings.fade_out_of_stock_option_values ) {
			
				let current_option_values = $.extend(true, {}, selected_option_values);
				delete current_option_values[po_id];
				
				let ro_combs = inst.getROCombsByOptions(current_option_values);
				let pov_ids_stock = inst.getPOVStockByROCombs(po_id, ro_combs);
				
				let $ov_elements = inst.getOptionElement('select[name="'+inst.option_prefix+'['+po_id+']"]').find('option[value]');
				if ( !$ov_elements.length ) {
					$ov_elements = inst.getOptionElement(':radio[name="'+inst.option_prefix+'['+po_id+']"]');
				}
				
				if ( $ov_elements.length ) {
					$ov_elements.each(function(){
						let $ov_element = $(this);
						
						if ( $ov_element.is(':disabled') ) {
							inst.controlOutOfStockOptionViewOneOptionIsDisabled($ov_element);
						} else {
							let pov_id = $ov_element.val();
							if ( typeof(pov_ids_stock[pov_id]) != 'undefined' ) {
								let pov_stock_data = pov_ids_stock[pov_id];
								if ( pov_stock_data.in_stock ) { // in stock
									inst.controlOutOfStockOptionViewOneOptionIsInStock($ov_element);
								} else {
									inst.controlOutOfStockOptionViewOneOptionIsOutOfStock($ov_element, (pov_ids_stock[pov_id].last_ro_comb ? pov_stock_data.last_ro_comb.stock_status || pov_stock_data.last_ro_comb.product_stock_status : ''));

								}
							}
						}
					});
				}
				

			}
		},
		
		controlOutOfStockOptionViewOneOptionIsDisabled : function($ov_element){
			if ( $ov_element.is('option') ) {
				$ov_element.removeClass('ro_option_faded');
			} else { // radio
				inst.setOriginalTitleForRadio($ov_element);
			}
		},
		
		controlOutOfStockOptionViewOneOptionIsOutOfStock : function($ov_element, title){
			if ( $ov_element.is('option') ) {
				$ov_element.addClass('ro_option_faded');
			} else { // radio
				inst.fadeToOptionRadio($ov_element, 0.3);
				if ( inst.ro_settings.spec_ofs ) {
					if ( title ) {
						inst.appendToTitleForRadio($ov_element, title );
					}
				}
			}
		},
		
		controlOutOfStockOptionViewOneOptionIsInStock : function($ov_element){
			if ( $ov_element.is('option') ) {
				$ov_element.removeClass('ro_option_faded');
			} else { // radio
				inst.fadeToOptionRadio($ov_element, 1);
				if ( inst.ro_settings.spec_ofs ) {
					inst.setOriginalTitleForRadio($ov_element);
				}
			}
		},
		
		getPOVStockByROCombs(po_id_current, ro_combs) {
			let pov_ids_stock = {};
				
			inst.each(ro_combs, function(ro_comb){
				inst.each(ro_comb.options, function(pov_id, po_id){
					if ( po_id == po_id_current ) {
						if ( !pov_ids_stock[pov_id] ) {
							pov_ids_stock[pov_id] = {
								in_stock : false,
								last_ro_comb : '',
							};
						}
						pov_ids_stock[pov_id].in_stock = pov_ids_stock[pov_id].in_stock || ro_comb.in_stock;
						pov_ids_stock[pov_id].last_ro_comb = ro_comb;
					}
				});
			});
			return pov_ids_stock;
		},
		
		fadeToOptionRadio : function($radio, fade_to){
			inst.fadeToForElement($radio.parent(), fade_to);
		},
		fadeToForElement : function($elem, fade_to) {
			$elem.stop().fadeTo('fast', fade_to);
		},
		
		setOriginalTitleForRadio : function($radio){
			let $elem = $radio.parent();
			if ( typeof($elem.attr('data-ro-original-title')) != 'undefined' ) {
				$elem.attr('title', $elem.attr('data-ro-original-title'));
			}
		},
		appendToTitleForRadio : function($radio, title_append) {
			let $elem = $radio.parent();
			if ( typeof($elem.attr('data-ro-original-title')) == 'undefined' ) {
				$elem.attr('data-ro-original-title', $elem.attr('title')||'');
			}
			$elem.attr('title', ($elem.attr('data-ro-original-title')+' '+title_append).trim() );
		},
		
		// autoselection for last available option value & first available always
		checkAutoSelect : function() {
		
			if (inst.auto_select_last || inst.auto_select_first_always) {
				
				inst.each(inst.getOptionsAsSteps(), function(product_option_id){
					
					if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]').length ) {
						
						var options_elems = inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]').find('option[value][value!=""]:not(:disabled)');
						
						if ( inst.auto_select_last && options_elems.length == 1 && !$(options_elems[0]).is(':selected')	|| ( inst.auto_select_first_always && options_elems.length && !options_elems.filter(':selected').length ) ) {
						
							let product_option_value_id = $(options_elems[0]).val();
							
							inst.setOptionValue(product_option_id, product_option_value_id);
							$(options_elems[0]).parent().change();
							return;
						}
						
					} else if ( inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]').length ) {
					
						var radio_elems = inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]:not(:disabled)');
						
						if ( inst.auto_select_last && radio_elems.length == 1 && !$(radio_elems[0]).is(':checked') || ( inst.auto_select_first_always && radio_elems.length && !radio_elems.filter(':checked').length ) ) {
							
							let product_option_value_id = $(radio_elems[0]).val();
							
							inst.setOptionValue(product_option_id, product_option_value_id);
							
							$(radio_elems[0]).change();
							return;
							
						}
					}
				});
			}
		},
		
		// autorelection for first values (initial)
		initialAutoSelect : function() {
			
			if (inst.ro_settings && inst.ro_settings.select_first && inst.ro_settings.select_first == 1) {
				inst.each(inst.getOptionsAsSteps(), function(product_option_id){
						
					if ( inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]').length ) {
						
						let elem = inst.getOptionElement('select[name="'+inst.option_prefix+'['+product_option_id+']"]');
						if ( !elem.val() ) {
						
							let elem_option = elem.find('option[value][value!=""]:not(:disabled)');
							if (elem_option.length) {
							
								inst.setOptionValue(product_option_id, elem_option.val() );
							
								elem.change();
							}
							
						}
						
					} else if ( inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]').length ) {
						
						if ( !inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]:checked').length ) {
							let elem = inst.getOptionElement('input:radio[name="'+inst.option_prefix+'['+product_option_id+']"]:not(:disabled):first');
							if (elem.length) {
								
								inst.setOptionValue(product_option_id, elem.attr('value') );
								
								elem.change();
								
							}
						}
					}
				
				
				});
			}
		},
		
		
	};
	
	if ( typeof(getROProductThemeMethods) == 'function' ) {
		inst.theme_methods = getROProductThemeMethods(inst);
		let debug = false;
		ro_common.proxyObjectMethods(inst, debug, inst.theme_methods);
	}
	
	inst.parentBlock = this;
	
	var params = $.extend( {
		'ro_settings' 	: {},
		'ro_texts'			: {},
		'ro_data' 			: false,
		'ro_theme_name' : '',
		'ros_to_select' : '',
		'poip_ov' 			: '',
		'filter_name'		: '',
		'product_id'		: 0,
	}, p_params);
	inst.ro_settings 		= params.ro_settings;
	inst.ro_theme_name 		= params.ro_theme_name;
	inst.ro_texts 			= params.ro_texts;
	inst.ro_data 			= params.ro_data;
	inst.ros_to_select 		= params.ros_to_select;
	inst.poip_ov 			= params.poip_ov;
	inst.filter_name 		= params.filter_name;
	inst.product_id 		= params.product_id;
	
	// settings
	inst.hide_inaccessible 	= inst.getSetting('hide_inaccessible');
	inst.step_by_step 		= inst.getSetting('step_by_step');
	
	inst.auto_select_last 	= inst.getSetting('select_first') == 2;
	inst.auto_select_first_always = inst.getSetting('select_first') == 3;
	
	inst.option_prefix = params.option_prefix || 'option';
	if ( !$('[name^="option["]').length ) {
		if ( $('[name^="option_oc["]').length ) { // mijoshop
			inst.option_prefix = "option_oc";
		}
	}
	inst.option_prefix_length = inst.option_prefix.length;
	
	// data
	inst.ro_product_options = [];
	if ( inst.ro_data ) {
		inst.each(inst.ro_data, function(ro_dt){
			var option_ids = ro_dt.options_ids;
			inst.each(option_ids, function(product_option_id){
				if ( $.inArray(product_option_id, inst.ro_product_options) == -1 ) {
					inst.ro_product_options.push(product_option_id);
				}
			});
		});
	}
	//var ro_exists = false;
	
	// variables 
	inst.linked_options_cache = {}; // cache
	inst.all_select_ov = {}; // selects cache
	inst.input_quantity_per_options = [];
	inst.ro_stock_control_last_call = '';
	inst.options_types = [];
	inst.options_step_by_step = [];
	inst.all_values_of_options = [];
		
	//inst.initRO(); // init should be started from outside, after assigning all additional functions/triggers
	
	$this.data('liveopencart_relatedOptions', inst);
	
	if ( !window.liveopencart ) {
		window.liveopencart = {};
	}
	if ( !window.liveopencart.related_options_instances ) {
		window.liveopencart.related_options_instances = [];
	}
	window.liveopencart.related_options_instances.push(inst);
	
	return inst;

}; })(jQuery);

