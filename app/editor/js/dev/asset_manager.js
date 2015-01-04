"use strict";

/**
* Asset manager class
*
* @class AssetManager
* @namespace Editor
*/
LR.Editor.AssetManager = function($http) {
    if (LR.Editor.AssetManager.INSTANCE == null) {
        this.$http = $http;

        LR.Editor.AssetManager.INSTANCE = this;
    }

    return LR.Editor.AssetManager.INSTANCE;
}

LR.Editor.AssetManager.prototype.constructor = LR.Editor.AssetManager;

LR.Editor.AssetManager.INSTANCE = null;

LR.Editor.AssetManager.prototype.loadImages = function(_url, _path, _promise) {
    var url = "" + _url;
    url += "?path=" + _path;
    this.$http.get(url).success(function(_data) {
        //parse names to find frames sizes
        for(var i=0; i < _data.images.length; i++){
            if( _data.images[i].frameWidth != null )
                continue;
            var imageName = _data.images[i].path;
            var regex = /[0-9]+x[0-9]+/.exec(imageName);
            if( regex ){
                var aFrame = regex[0].split("x");
                _data.images[i].frameWidth = parseInt(aFrame[0]);
                _data.images[i].frameHeight = parseInt(aFrame[1]);
            }
        }

        if (typeof _promise === "function") {
            _promise(null, _data);
        }
    }).error(function(_error) {
        if (typeof _promise === "function") {
            _promise(_error, null);
        }
    });
};

LR.Editor.AssetManager.GetInstance = function() {
    return LR.Editor.AssetManager.INSTANCE;
}