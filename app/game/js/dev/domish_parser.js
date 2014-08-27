"use strict";

function DOMishParser() {}
DOMishParser.prototype.parseFromString = function (data) {
    return new DOMishObject(JSON.parse(data));
};

function DOMishAttributes() {}
DOMishAttributes.prototype.getNamedItem = function (name) {
    return {
        nodeValue: this[name] || null
    };
};

function makeDOMishObject(data) {
    return new DOMishObject(data);
}

function DOMishObject(data) {
    this.attributes = this.convertContent(data);
    this.length = Object.keys(this.attributes).length;
}
DOMishObject.prototype.documentElement = document;
DOMishObject.prototype.convertContent = function (obj) {
    var attributes = new DOMishAttributes(),
        prop;

    for (prop in obj) {
        if (obj[prop] !== null && typeof obj[prop] === 'object') {
            attributes[prop] = Array.isArray(obj[prop]) ?
                obj[prop].map(makeDOMishObject) : new DOMishObject(obj[prop]);
        } else {
            attributes[prop] = obj[prop];
        }
    }

    return attributes;
};
DOMishObject.prototype.getElementsByTagName = function(name) {
    var array = this.attributes[name] ?
        Array.isArray(this.attributes[name]) ?
        this.attributes[name] : [this.attributes[name]] : [];
    return array;
};
DOMishObject.prototype.getAttribute = function (name) {
    return this.attributes[name] || null;
};