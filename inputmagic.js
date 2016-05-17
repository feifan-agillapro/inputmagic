;$ = jQuery;

if (typeof Array.prototype.indexOf == "undefined") {
  Array.prototype.indexOf = function(needle) {
    for (var x = 0; x < this.length; x++) {
      if (this[x] === needle) return x;
    }
    return -1;
  }
}

IMTagMultiSelect = function( element, settings ) {
	this.selected = [];
	this.settings = settings;
	this.sizer = $('<div>', {'class':'im-tagmultiselect-sizer'});
	this.autocomplete = $('<div>', {'class':'im-tagmultiselect-autocomplete'})
	this.input = $('<input>', {'class':'im-tagmultiselect-input'})
		.keydown($.proxy(this.keyDownHandler, this))
		.keyup($.proxy(this.keyupHandler, this))
		.focusin($.proxy(this.grabFocus, this))
		.focusout($.proxy(this.dropFocus, this));
	this.selection = $('<div>', {'class':'im-tagmultiselect-selection'})
		.append($('<div>', {'class':'im-inline-block im-tagmultiselect-inputcontainer'})
			.append(this.input)
			.append(this.autocomplete)
		);
	this.container = $('<div>', {'class':'im-input im-tagmultiselect-container'})
		.data('magic', this)
		.css({'width':element.width()})
		.click($.proxy(this.grabFocus, this))
		.append(this.sizer)
		.append($('<div>', {'class':'im-tagmultiselect-inner'})
			.append(this.selection)
		);

	this.applySettings();
	element.hide();
	element.change($.proxy(this.update, this))
		.after(this.container);
	this.anchor = element;
	this.update();
};

IMTagMultiSelect.prototype.applySettings = function() {
	var settings = this.settings;
	if (settings.class) {
		this.container.addClass(settings.class);
	}
};

IMTagMultiSelect.prototype.grabFocus = function(event) {
	this.container.addClass('focused');
	if (event.type != "focusin") this.container.find('input').focus();
};

IMTagMultiSelect.prototype.dropFocus = function(event) {
	this.container.removeClass('focused');
};

IMTagMultiSelect.prototype.removeLastTag = function() {
	if (this.selected.length) {
		$(this.selected[this.selected.length-1]).removeProp('selected');
		this.update();
	}
};

IMTagMultiSelect.prototype.doAutoComplete = function() {
	var magic = this;
	var enabledOptions = this.anchor.find('option:enabled:not(:selected)');
	options = enabledOptions.filter(function(){
		return ($(this).html().toLowerCase().indexOf(magic.input.val().toLowerCase()) == 0 && $(this).val().length > 0);
	});

	// options.join(enabledOptions.filter(function(){
	// 	return ($(this).html().toLowerCase().indexOf(magic.input.val().toLowerCase()) > 0 && $(this).val().length > 0);
	// }));

	var list = $('<div>', {'class':'im-tagmultiselect-options'});

	options.each(function(){
		var option = $(this);
		var magicOption = $('<div>', {'class':'im-tagmultiselect-option'})
			.html(option.val())
			.data('anchor', option)
			.click(function(){
				$(this).data('anchor').prop('selected', 'selected');
				magic.update();
				magic.input.val('');
				magic.doAutoComplete();
			});
		list.append(magicOption);
	});

	if (options.length && this.input.val().length) {
		list.find('.im-tagmultiselect-option').first().addClass('im-selected');
		this.autocomplete.show();
		this.autocomplete.html(list);
	} else {
		this.autocomplete.hide();
	}
};

IMTagMultiSelect.prototype.keyDownHandler = function(event) {
		switch (event.keyCode) {
			case 8:
				if (!this.input.val().length) this.removeLastTag();
				break;
			case 9:
				event.preventDefault();
				break;
    case 38:
    	event.preventDefault();
  		var selected = this.autocomplete.find('.im-selected');
  		var next = selected.prev('.im-tagmultiselect-option');
  		if (next.length) {
  			selected.removeClass('im-selected');
  			next.addClass('im-selected');
  		}
      break;
    case 40:
    	event.preventDefault();
  		var selected = this.autocomplete.find('.im-selected');
  		var next = selected.next('.im-tagmultiselect-option');
  		if (next.length) {
  			selected.removeClass('im-selected');
  			next.addClass('im-selected');
  		}
      break;
		}
		this.resizeInput();
}

IMTagMultiSelect.prototype.keyupHandler = function(event) {
	var autoCompletable = true;
	switch (event.keyCode) {
  	case 9:
  	case 13:
  		event.preventDefault();
  		if (this.autocomplete.find('.im-selected:visible').length) {
				this.autocomplete.find('.im-selected:visible').data('anchor').prop('selected', 'selected');
				this.update();
				this.input.val('');
			}
			break;
  	case 38:
  	case 40:
  		autoCompletable = false;
    default:
    	// this.doFilter(String.fromCharCode(event.keyCode))
    	break;
  }
	this.resizeInput(event);
	if (autoCompletable) {
		this.doAutoComplete();
	}
};

IMTagMultiSelect.prototype.resizeInput = function() {
	var text = this.input.val().replace(/ /g, '\u00A0');
	this.sizer.html(text)
		.show();

	var width = this.sizer.width();

	if (width > this.container.width()-25) {
		width = this.container.width() -25;
	}

	this.input.css('width', (width + 20) + 'px');
	this.sizer.hide();

	if (this.anchor.find(':selected').length) {
		this.container.height(this.container.find('.im-tagmultiselect-inner').outerHeight());
	}
};

IMTagMultiSelect.prototype.update = function() {
	var magic = this;
	magic.selection.find('.im-tagmultiselect-inputcontainer').prevAll().remove();

	magic.anchor.find(':selected').each(function(){
		if (magic.selected.indexOf(this) === -1) {
			magic.selected.push(this);
		}
	});

	for (var x = 0; x < magic.selected.length; x++) {
		if (magic.anchor.find(':selected').toArray().indexOf(magic.selected[x]) === -1) {
			magic.selected.splice(x, 1);
			continue;
		}
	}

	for (var x = 0; x < magic.selected.length; x++) {
		var option = $(this.selected[x]);
		var tag = $('<div>', {'class':'im-tagmultiselect-tag im-inline-block'});
		var text = $('<span>', {'class':'im-tagmultiselect-tagtext'})
			.html(option.val());
		var closeButton = $('<div>', {'class':'im-tagmultiselect-tagclose im-inline-block'})
			.html('x')
			.data('anchor', option);
		closeButton.click(function(){
			$(this).data('anchor').removeProp('selected');
			magic.anchor.change();
		});
		tag.append(text)
			.append(closeButton);
		magic.selection.find('.im-tagmultiselect-inputcontainer').before(tag);
	}

	if (magic.anchor.find(':selected').length) {
		this.container.height(this.container.find('.im-tagmultiselect-inner').outerHeight());
	}
};

IMSelect = function( element, settings ) {
	this.settings = settings;
	this.filterString = '';
	this.isOpen = false;
	this.selection = $('<span>', {'class':'im-select-selection im-inline-block'});
	this.container = $('<div>', {'class':'im-input im-select-container'})
		.data('magic', this)
		.css({'width':element.width()})
		.click($.proxy(this.open, this))
		.append(this.selection)
		.append('<span class="im-select-caret">\u25BE</span>')
		.prop('tabindex', 0)
		.focusin($.proxy(this.grabFocus, this))
		.focusout($.proxy(this.dropFocus, this));
	this.anchor = element.hide().change($.proxy(this.update, this)).after(this.container);
	this.update();
};

IMSelect.prototype.applySettings = function() {
	var settings = this.settings;
	if (settings.class) {
		this.container.addClass(settings.class);
	}
};

IMSelect.prototype.grabFocus = function() {
	this.container.addClass('focused');
	$('html').unbind('keyup', this.keyupHandler);
	$('html').keyup($.proxy(this.keyupHandler, this))
};

IMSelect.prototype.dropFocus = function() {
	this.container.removeClass('focused');
	$('html').unbind('keyup', this.keyupHandler);
}

IMSelect.prototype.update = function() {
	this.selection.html(this.anchor.find(':selected').html());
};

IMSelect.prototype.refresh = function(event) {
	this.close(event);
	this.open(event);
}

IMSelect.prototype.close = function(event) {
	this.isOpen = false;
	if (this.options) {
		$('html').unbind('click', this.close);
		this.options.remove();
		delete this.options;
		this.container.removeClass('open');
		this.container.focus();
	}
};

IMSelect.prototype.buildOptions = function() {
	var magic = this;
	var magicOptions = $('<div>', {'class':'im-select-options'})
		.css({'width':this.container.width(),'z-index':this.container.getZIndex()+1});
	this.anchor.find('option:enabled').each(function(){
		var option = $(this);
		var magicOption = $('<div>', {'class':'im-select-option'})
			.append((this.value.length) ? '<span>'+this.innerHTML+'</span>' : '<span>None</span>');

		if (magic.settings.columns) {
			for (var x = 0; x < magic.settings.columns.length; x++) {
				var columnName = magic.settings.columns[x];
				magicOption.append($('<span>').html($(this).data(columnName)));
			}
		}

		if ($(this).is(':selected') && this.value.length) {
			magicOption.addClass('im-selected');
		}

		magicOption.click(function(){
			magic.anchor.find('.im-select-option').removeProp('selected');
			option.prop('selected', 'selected');
			magic.update();
		});

		magicOptions.append(magicOption);
	});
	var columnCount = magicOptions.find('div.im-select-option').last().find('span').length;
	magicOptions.find('div.im-select-option span').css('width', (100 / columnCount).toString() + "%");
	return magicOptions;
};

IMSelect.prototype.keyupHandler = function(event) {
  switch (event.keyCode) {
  	case 9:
  	case 13:
  		event.preventDefault();
  		this.update();
  		if (this.isOpen) this.close(event);
  		break;
    case 38:
    case 40:
      event.preventDefault();
      var selectedOption = this.anchor.find('option:selected');
      var nextOption = (event.keyCode == 40) ? selectedOption.next('option:enabled') : selectedOption.prev('option:enabled');
	    if (nextOption.length > 0) {
	    	nextOption.prop('selected', 'selected');
	    	selectedOption.removeProp('selected');
	    	this.update();
	    	if (this.isOpen) this.refresh(event);
	    }
      break;
    default:
    	this.doFilter(String.fromCharCode(event.keyCode))
    	break;
  }
};

IMSelect.prototype.clearFilter = function() {
	this.filterString = '';
};

IMSelect.prototype.doFilter = function(letter) {
	this.filterString += letter.toLowerCase();
	var filterString = this.filterString;
	var matches = this.anchor.find('option:enabled').filter(function(){
		return (($(this).val().length || $(this).val().length)
			&& ($(this).val().toLowerCase().indexOf(filterString) === 0 
			|| $(this).html().toLowerCase().indexOf(filterString) === 0));
	});

	if (matches.length) {
		this.anchor.find('option:enabled').removeProp('selected');
		matches.first().prop('selected', 'selected');
		this.update();
  	if (this.isOpen){
    	this.refresh(event);
  	}
	} else {
		this.filterString = (this.filterString.substring(0, this.filterString.length -1));
	}

	if (this.filterTimeout) clearTimeout(this.filterTimeout);
	this.filterTimeout = setTimeout($.proxy(this.clearFilter, this), 1000);
};

IMSelect.prototype.open = function(event) {
	$('html').unbind('keyup', this.keyupHandler);
	this.container.focus();
	this.isOpen = true;
	event.stopPropagation();
	if ($('.im-select-container.open').length) {
		$('.im-select-container.open').each(function(){
			$(this).data('magic').close(event);
		});
		return false;
	}
	this.options = this.buildOptions();
	this.container.addClass('open').append(this.options);
	$('html').click($.proxy(this.close, this));
};

$.fn.extend({
	magic : function( settings ) {
		settings = settings || {};
		return this.each(function() {
			var magic, object;
			object = $(this);
			magic = object.data('magic');
			if (magic) {
				if (settings == 'update') {
					magic.update();
				}
			} else {
				switch (object.prop('type')) {
					case 'select-one':
						object.data('magic', new IMSelect(object, settings));
						break;
					case 'select-multiple':
						if (settings.type == 'tags') {
							object.data('magic', new IMTagMultiSelect(object, settings));
						}
						break;
				}
			}
		});
	},
	getZIndex : function() {
		if (this.length) {
			var element = $(this);
			var position = element.css('position');
			if ( ['relative', 'absolute', 'fixed'].indexOf(position) > -1 && (!isNaN(element.css("zIndex")) && element.css('zIndex') > 0)) return element.css('zIndex');
		}
		return 0
	},
	getCursorPosition : function() {

		if ($(this).is('input')) {
			if ($(this).hasProp('selectionStart')) return $(this).hasProp('selectionStart');
			if (document.selection) {
				var selection = document.selection;
				this.focus();

			}
		}

		return false;
    var input = this.get(0);
    if ('selectionStart' in input) {
      return input.selectionStart;
    } else if (document.selection) {
      // IE
      input.focus();
      var sel = document.selection.createRange();
      var selLen = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return sel.text.length - selLen;
    }
  },
  hasProp : function(propertyName) {
  	return (typeof this.prop(propertyName) != "undefined");
  }
});