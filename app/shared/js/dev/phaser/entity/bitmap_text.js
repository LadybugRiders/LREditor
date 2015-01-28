"use strict";
/**
* BitmapText class for webfonts
*
* @namespace Entity
* @class BitmapText
* @constructor
* @param {Phaser.Game} game
* @param {number} x
* @param {number} y
* @param {string} _key BitmapText to display
* @param {Object} _text Base text
* @param {Number} _size 
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.BitmapText = function(_game, _x, _y, _key, _text, _size, _name) {

	Phaser.BitmapText.call(this, _game, _x, _y, _key, _text, _size);
	
	//this.anchor.setTo(0.5, 0.5);

	this.go = new LR.GameObject(this);
	if (_name != null) {
		this.go.name = _name;
	} else {
		this.go.name = "BitmapText";
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
	* Defines the fixed count of digit you want if the text holds a number
	* ie : with numberPadding == 3 , 6 will be displayed as "006"
	*
	* a value of 0 deactivates the padding
	* @property numberPadding
	* @type number
	* @default 0
	*/
	this.numberPadding = 0;

	/**
	* Maximum number of characters on a line
	* a value of 0 deactivates the wrapping
	*
	* @property maxCharPerLine
	* @type number
	* @default 0
	*/
	this._maxCharPerLine = 0;

	this.lines = 0;
};

LR.Entity.BitmapText.prototype = Object.create(Phaser.BitmapText.prototype);
LR.Entity.BitmapText.prototype.constructor = LR.Entity.BitmapText;

Object.defineProperty(LR.Entity.BitmapText.prototype, "maxCharPerLine", 
{
	get : function(){
		return this._maxCharPerLine;
	},

	set : function (_value) {
		if( typeof _value == "number"){
			this._maxCharPerLine = _value;
			this.text = this.text;
		}
	}
});

/**
* The defineProperty is overrided to enable auto number padding, prefix and suffix.
* @name LR.Entity.BitmapText#text
* @property {string} text - The text string to be displayed by this BitmapText object, taking into account the style settings.
*/
Object.defineProperty(LR.Entity.BitmapText.prototype, "text", 
	{
		get: function() {
       		return this._text;
    	},

	    set: function(value) {
	    	if (value) {
		    	var _stringValue = value.toString();
		    	//check padding for number values
				if( typeof value == "number" && this.numberPadding > 0){
					_stringValue = this.pad( value, this.numberPadding );
				}

				if( this.maxCharPerLine > 0)
					_stringValue = this.wrapText(_stringValue);

		        if (_stringValue !== this._text)
		        {
		            this._text = this.prefix + ( _stringValue || ' ' ) + this.suffix ;
		            this.dirty = true;
		            this.updateTransform();
		        }
		    }
		}
	}
); 

// Called when the scene is launching. All objects are created then.
LR.Entity.BitmapText.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.BitmapText.prototype.update = function() {
	Phaser.BitmapText.prototype.update.call(this);
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

LR.Entity.BitmapText.prototype.postUpdate = function() {
	Phaser.BitmapText.prototype.postUpdate.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.postUpdate();
		}
	}
};

LR.Entity.BitmapText.prototype.render = function() {
	Phaser.BitmapText.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.BitmapText.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.BitmapText.prototype.destroy.call(this);
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
LR.Entity.BitmapText.prototype.bindToVariable = function(_variableName,_context,_prefix,_suffix) {
	this.boundVariable = _variableName;
	this.boundContext = _context;
	if( _prefix != null )
		this.prefix = _prefix;
	if( _suffix != null )
		this.suffix = _suffix;
};

LR.Entity.BitmapText.prototype.pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

LR.Entity.BitmapText.prototype.wrapText = function(_string){	
	if( _string.length < this.maxCharPerLine)
		return _string;
	
	var s = "";
	var array = _string.split(" ");
	var i=0;
	var count = 0;
	this.lines = 0;
	while( i< array.length ){
		var word = array[i];
		i++;
		var newLineIndex = word.indexOf("\n");
		if(newLineIndex >= 0){
			count = word.length - newLineIndex + 1;
		}else{
			count += word.length + 1;
		}

		if( count >= this.maxCharPerLine && i < array.length){
			count = 0;
			s += "\n";
			this.lines ++;
		}

		if(i < array.length) word += " ";

		s+=word;
	}
	return s;
}