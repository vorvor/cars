<?php

/**
 * @file Drush integration for the prepro module.
 */

/**
 * Implements hook_drush_command().
 *
 * @See drush_parse_command() for a list of recognized keys.
 *
 * @return
 *   An associative array describing your command(s).
 */
function prepro_drush_command() {
  $items = array();

  $items['prepro-cache-clear'] = array(
    'description' => "Immediately clear the prepro caches.",
    'drupal dependencies' => array('prepro'),
    'aliases' => array('pcc'),
  );

  return $items;
}

/**
 * Implements hook_drush_help().
 */
function prepro_drush_help($section) {
  switch ($section) {
    case 'drush:prepro':
      return dt("clear the prepro cache so that your preprocessor can redo/or recompile whatever you expect it to.");
      break;
  }
}

/**
 * Clear the prepro cache
 */
function drush_prepro_cache_clear() {
  cache_clear_all('prepro:map', 'cache_prepro');
  if (module_exists('sassy')) {
    drupal_clear_css_cache();
    //drupal_clear_js_cache();
    drush_log(dt('prepro and css caches were cleared (your .scss will be recompiled on next page load).'), 'success');
  } else {
    drush_log(dt('prepro cache was cleared.'), 'success');
  }
  return TRUE;
}
