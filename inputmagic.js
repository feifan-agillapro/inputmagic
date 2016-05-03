;$ = jQuery;

IMTagMultiSelect = function( element, settings ) {
	this.selected = [];
	this.settings = settings;
	this.sizer = $('<div>', {class:'im-tagmultiselect-sizer'});
	this.input = $('<input>', {class:'im-tagmultiselect-input'})
		.keyup($.proxy(this.resizeInput, this))
		.keydown($.proxy(this.resizeInput, this));
	this.container = $('<div>', {class:'im-input im-tagmultiselect-container'})
		.data('magic', this)
		.css({width:element.width()})
		.click($.proxy(this.focus, this))
		.append(this.sizer)
		.append($('<div>', {class:'im-tagmultiselect-inner'}).append(this.input));
	// element.hide();
	element.change($.proxy(this.update, this))
		.after(this.container);
	this.anchor = element;
	this.update();
};

IMTagMultiSelect.prototype.focus = function() {
	this.container.find('input').focus();
}

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
};

IMTagMultiSelect.prototype.update = function() {
	var magic = this;
	magic.anchor.find(':selected').each(function(){
		
	});
};

IMSelect = function( element, settings ) {
	this.settings = settings;
	this.selection = $('<span>', {class:'im-select-selection'});
	this.container = $('<div>', {class:'im-input im-select-container'})
		.data('magic', this)
		.css({width:element.width()})
		.click($.proxy(this.open, this))
		.append(this.selection)
		.append('<span class="im-select-caret">\u25BE</span>');
	this.anchor = element.hide().change($.proxy(this.update, this)).after(this.container);
	this.update();
};

IMSelect.prototype.update = function() {
	this.selection.html(this.anchor.find(':selected').html());
};

IMSelect.prototype.close = function(event) {
	if (this.options) {
		$('html').unbind('click', this.close);
		$('html').unbind('keyup', this.keyupHandler);
		this.options.remove();
		delete this.options;
		this.container.removeClass('open');
	}
};

IMSelect.prototype.buildOptions = function() {
	var magic = this;
	var magicOptions = $('<div>', {class:'im-select-options'}).css({'width':this.container.width(),'z-index':this.container.getZIndex()+1});
	this.anchor.find('option:enabled').each(function(){
		var option = $(this);
		var magicOption = $('<div>', {class:'im-select-option'})
			.append((this.value.length) ? '<span>'+this.innerHTML+'</span>' : '<span>None</span>');

		if (magic.settings.columns) {
			for (var x = 0; x < magic.settings.columns.length; x++) {
				var columnName = magic.settings.columns[x];
				magicOption.append($('<span>').html($(this).data(columnName)));
			}
		}

		if ($(this).is(':selected') && this.value.length) {
			magicOption.addClass('selected');
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
}

IMSelect.prototype.keyupHandler = function(event) {
  switch (event.keyCode) {
  	case 9:
  	case 13:
  		event.preventDefault();
  		this.update();
  		this.close();
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
	    	this.close();
	    	this.open(event);
	    }
      break;
  }
}

IMSelect.prototype.open = function(event) {	
	$('html').unbind('keyup', this.keyupHandler);
	event.stopPropagation();
	if (this.options) {
		this.close();
		return;
	}
	if ($('.im-select-container.open').length) {
		$('.im-select-container.open').each(function(){
			$(this).data('magic').close();
		});
	}
	this.options = this.buildOptions();
	this.container.addClass('open').append(this.options);
	$('html').click($.proxy(this.close, this)).keyup($.proxy(this.keyupHandler, this));
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
	}
});