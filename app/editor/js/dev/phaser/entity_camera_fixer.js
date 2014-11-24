//
// This behaviour is attached to the sprite/object to simulate the fixedToCamera Behaviour
// This will place the sprite according to the camera position defined for the game
//
LR.Editor.Behaviour.EntityCameraFixer = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
    this.$scope = _$scope;
};

LR.Editor.Behaviour.EntityCameraFixer.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.EntityCameraFixer.prototype.constructor = LR.Editor.Behaviour.EntityCameraFixer;

LR.Editor.Behaviour.EntityCameraFixer.prototype.update = function(){
    if( this.$scope.game.camera.ed_debugObject != null ){
    	var rectObject = this.$scope.game.camera.ed_debugObject;
        this.entity.go.x = rectObject.graphicsData[0].shape.x + this.entity.cameraOffset.x;
        this.entity.go.y = rectObject.graphicsData[0].shape.y + this.entity.cameraOffset.y;
        
    }
}

LR.Editor.Behaviour.EntityCameraFixer.prototype.onSelected = function(){
}