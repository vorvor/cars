/**
 * @file
 * JavaScript for bulk_select.
 */

(function ($) {

  /**
   * Toggle the visibility using smooth animations.
   */
  Drupal.toggleBulkSelect = function (label) {
    var $label = $(label);
    if ($label.is('.collapsed')) {

      var $content = $label.parent().next('.nested').hide();
      $label
        .removeClass('collapsed')
        .trigger({ type: 'collapsed', value: false })
        .find('> span.collapsed-status-indicator').html(Drupal.t('Hide'));
      $content.slideDown({
        duration: 'fast',
        easing: 'linear',
        complete: function () {
          Drupal.collapseScrollIntoView(label);
          label.animating = false;
        },
        step: function () {
          // Scroll it into view.
          Drupal.collapseScrollIntoView(label);
        }
      });
    }
    else {
      $label.trigger({ type: 'collapsed', value: true });
      $label.parent().next('.nested').slideUp('fast', function () {
        $label
          .addClass('collapsed')
          .find('> span.collapsed-status-indicator').html(Drupal.t('Show'));
        label.animating = false;
      });
    }
  };

  /**
   * Scroll a given element into view as much as possible.
   */
  Drupal.collapseScrollIntoView = function (node) {
    var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
    var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
    var posY = $(node).offset().top;
    var fudge = 55;
    if (posY + node.offsetHeight + fudge > h + offset) {
      if (node.offsetHeight > h) {
        window.scrollTo(0, posY);
      }
      else {
        window.scrollTo(0, posY + node.offsetHeight - h + fudge);
      }
    }
  };

  Drupal.behaviors.bulkSelect = {
    attach: function (context, settings) {
      $('.form-bulk-select .nesting-label.collapsible', context).once('collapse', function () {
        var $label = $(this);
        var $content = $label.parent().next('.nested');

        // Expand nest if there are selected checkboxes inside.
        if ($label.hasClass('expand-selected') && $content.find('input:checked').length) {
          $label.removeClass('collapsed');
        }

        // Do an initial hide.
        if ($label.hasClass('collapsed')) {
          $content.hide();
        }

        $('<span class="collapsed-status-indicator element-invisible"></span>')
          .append($label.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
          .prependTo($label)
          .after(' ');

        // .wrapInner() does not retain bound events.
        var $link = $('<a class="nesting-label-title" href="#"></a>')
          .prepend($label.contents())
          .appendTo($label)
          .on('click keypress', function () {
            var label = $label.get(0);
            // Don't animate multiple times.
            if (!label.animating) {
              label.animating = true;
              Drupal.toggleBulkSelect(label);
            }
            return false;
          });

      });

      $('.form-bulk-select .nesting-label', context).once('switches', function () {
        var $label = $(this);
        var $content = $label.parent().next('.nested');

        $('<input type="checkbox" class="master-switch" />')
          .prependTo($label)
          .after(' ')
          .on('change', function(e){
            var $label = $(this).parent();
            var $content = $label.parent().next('.nested');

            $content.find('input').prop('checked', $(this).prop('checked')).last().trigger('change');

            // Expand nest if there are selected checkboxes inside.
            if ($label.hasClass('expand-selected') && $content.find('input:checked').length && $label.hasClass('collapsed')) {
              var label = $label.get(0);
              $('> a', label).click();
            }
          });

        if (!$content.find('input:checkbox:not(:checked)').length) {
          // All of the children are checked.
          $label.find('input.master-switch').prop('checked', true);
        }

      });

      $('.form-bulk-select input:checkbox', context).on('change', function(e){
        $(this).parents('.nested').each(function(){
          var $this = $(this);
          var $masterSwitch = $this.prev().find('input.master-switch');
          if ($masterSwitch.prop('checked') && $this.find('input:checkbox:not(:checked)').length) {
            // If the master switch is ticked but we found some children that aren't ticked.
            $masterSwitch.prop('checked', false);
          }
          else if (!$masterSwitch.prop('checked') && !$this.find('input:checkbox:not(:checked)').length) {
            // If the master switch is unticked but there are no unticked children.
            $masterSwitch.prop('checked', true);
          }
        });
      });
    }
  };

  $(document).bind('state:collapsed', function(e) {
    if (e.trigger) {
      if ($(e.target).is('.collapsed') !== e.value) {
        $('> a', e.target).click();
      }
    }
  });

})(jQuery);
