<?php

class theme_methods extends model {
  
  public function getSettings() {
    return array(
      'add_option_images_to_additional_on_server_side' => true, // otherwise it may do not display the list of additional images (if there is only 1 image to display)
      'do_not_add_main_image_to_additional_images' => true, // when added by the theme itseft
      
      'option_thumb_sizes' => array(
        'width' => defined('JOURNAL3_ACTIVE') ? $this->journal3->settings->get('image_dimensions_options.width') : 50,
        'height' => defined('JOURNAL3_ACTIVE') ? $this->journal3->settings->get('image_dimensions_options.height') : 50,
      ),
    );
  }
  
  public function resize($image, $width, $height, $image_type='') {
    if ( $image_type == 'thumb' && $this->journal3->settings->get('image_dimensions_'.'additional'.'.resize') ) {
      return $this->model_journal3_image->resize($image, $width, $height, $this->journal3->settings->get('image_dimensions_'.'additional'.'.resize'));
    } elseif ( $image_type && $this->journal3->settings->get('image_dimensions_'.$image_type.'.resize') ) {
      return $this->model_journal3_image->resize($image, $width, $height, $this->journal3->settings->get('image_dimensions_'.$image_type.'.resize'));
    } else {
      return $this->model_journal3_image->resize($image, $width, $height, $this->journal3->settings->get('image_dimensions_popup.resize'));
    }
    //return $this->model_journal3_image->resize($image, $width, $height);
  }
  
  //public function getProductListImageExtras($image, $pov_id) {
  //  $this->poip->getModel()->image_resize($image, , );
  //}
  
}