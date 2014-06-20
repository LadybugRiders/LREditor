"use strict";
/**
* Text class for webfonts
*
* @namespace Entity
* @class Text
* @constructor
* @param {Phaser.Game} game
* @param {number} x
* @param {number} y
* @param {string} _baseText Text to display
* @param {Object} style Style of the text. If null, a default one will be used
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.Text = function(_game, _x, _y, _baseText, _style, _name) {
	//Create default style if none is given
	if( _style == null ){
		_style = { font: "35px Arial", fill: "#ffffff", align: "center" };
	}
	Phaser.Text.call(this, _game, _x, _y, _baseText,_style);

	this.go = new LR.GameObject(this);
	if( _name != null ){
		this.go.name = _name;
	}else{
		this.go.name = "Text";
	}

	/**
	* String to apply before the text 
	*
	* @property prefix
	* @type {string}
	* @default ""
	*/
	this.prefix = "";
	/**
	* String to apply after the text 
	*
	* @property suffix
	* @type {string}
	* @default ""
	*/
	this.suffix = "";

	/**
	* The context of the bounded variable ( if any )
	*
	* @property boundContext
	* @type {Object}
	* @default null
	*/
	this.boundContext = null;

	/**
	* The name of the variable bound to this entity. 
	* The value of this variable will be displayed in this text, using prefix and suffix if they are set
	*
	* Set to null to stop listening to a variable
	*
	* @property boundVariable
	* @type {string}
	* @default null
	*/
	this.boundVariable = null;

	/**
	* FDfines the fixed count of digit you want if the text holds a number
	* ie : with numberPadding == 3 , 6 will be displayed as "006"
	*
	* a value of 0 deactivates the padding
	* @property numberPadding
	* @type number
	* @default 0
	*/
	this.numberPadding = 0;
};

LR.Entity.Text.prototype = Object.create(Phaser.Text.prototype);
LR.Entity.Text.prototype.constructor = LR.Entity.Text;

/**
* The defineProperty is overrided to enable auto number padding, prefix and suffix.
* @name LR.Entity.Text#text
* @property {string} text - The text string to be displayed by this Text object, taking into account the style settings.
*/
Object.defineProperty(LR.Entity.Text.prototype, "text", 
	{
		get: function() {
       		return this._text;
    	},

	    set: function(value) {
	    	var _stringValue = value.toString();
	    	//check padding for number values
			if( typeof value == "number" && this.numberPadding > 0){
				_stringValue = this.pad( value, this.numberPadding );
			}

	        if (_stringValue !== this._text)
	        {
	            this._text = this.prefix + ( _stringValue || ' ' ) + this.suffix ;
	            this.dirty = true;
	            this.updateTransform();
	        }
		}
	}
); 

// Called when the scene is launching. All objects are created then.
LR.Entity.Text.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.Text.prototype.update = function() {
	Phaser.Text.prototype.update.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.update();
		}
	}
	//display bound variable
	if( this.boundVariable != null ){
		var value = this.boundContext[this.boundVariable];
		this.text = value ;
	}
};

LR.Entity.Text.prototype.render = function() {
	Phaser.Text.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.Text.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.Text.prototype.destroy.call(this);
};

/**
* Tells this text entity to display the specified variable.
* This will be effective even if the variable value changes.
*
* @method bindToVariable
* @param {string} variableName The name of the variable to bind
* @param {Object} context The context holding the variable
* @param {string} prefix String to apply before the variable value
* @param {string} suffix String to apply after the variable value
*/
LR.Entity.Text.prototype.bindToVariable = function(_variableName,_context,_prefix,_suffix) {
	this.boundVariable = _variableName;
	this.boundContext = _context;
	if( _prefix != null )
		this.prefix = _prefix;
	if( _suffix != null )
		this.suffix = _suffix;
};

LR.Entity.Text.prototype.pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}