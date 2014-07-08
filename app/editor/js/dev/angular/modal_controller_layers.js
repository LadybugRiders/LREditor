"use strict";

var LayersCtrlModal = function ($scope, $modalInstance, $timeout) {

  //Basically we want to build a matrix representating the layer collisions
  
  function main() {
    $scope.modalLayersData.layersText = "{}";
    if (typeof $scope.modalLayersData.layers === "object") {
      $scope.modalLayersData.layersText = JSON.stringify($scope.modalLayersData.layers);
    }
    //get an array of layers names
    $scope.modalLayersData.layersNames = new Array();
    for( var key in $scope.modalLayersData.layers){
      $scope.modalLayersData.layersNames.push( key );
    }
    //Build matrix from scratch
    $scope.modalLayersData.matrix = $scope.buildMatrix($scope.modalLayersData.layersNames);
    //Fill it with the right values
    $scope.fillMatrix( $scope.modalLayersData.matrix, $scope.modalLayersData.layers);

  };

  $scope.save = function () {
   
    var layers = new Object();
    var m = $scope.modalLayersData.matrix;
    //for each layer in the matrix
    for(var i=0; i < m.length; i++){
      //this is the array containing the names of the colliding layers
      var arrayColl = new Array();
      //iterate the matrix and add the colliding layers
      for( var j = 0; j < m.length; j++){
        if( m[i][j] == true){
          arrayColl.push( $scope.modalLayersData.layersNames[j]);
        }
      }
      //Then create the object for the layer
      var layObject = { collisions : arrayColl };
      layers[$scope.modalLayersData.layersNames[i]] = layObject;
    }

    $scope.modalLayersData.layers = layers;  
    $scope.$emit("sendLayersEmit",{"layers" : $scope.modalLayersData.layers });
    
    $modalInstance.close(null);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  //===================================================
  //          MATRIX BUILDING
  //===================================================

  $scope.buildMatrix = function(_layersNames){
    //then begin to build the matrix
    var matrix = new Array();
    for( var i=0; i < _layersNames.length; i++){ 
      var array = new Array();
      for(var j=0; j < _layersNames.length;j ++)
        array.push(false)
      matrix.push( array );
    }
    return matrix;
  }

  //check which layers are colliding, and check them in the matrix
  $scope.fillMatrix = function( _matrix , _layers ){
    //go trhough each layer
    for( var key in $scope.modalLayersData.layers){
      var l1 = $scope.getLayerIndex(key);
      //get the colliders layers
      var collArray = $scope.modalLayersData.layers[key].collisions;
      for( var i=0; i < collArray.length; i++){
        var l2 = $scope.getLayerIndex(collArray[i]);
        $scope.checkMatrix(_matrix,l1,l2,true)
      }
    }
  }

  //===================================================
  //          MATRIX OPERATION
  //===================================================

  $scope.onCollisionChanged = function(_i, _j){
    var value = $scope.modalLayersData.matrix[_i][_j];
    $scope.modalLayersData.matrix[_i][_j] = value;
    $scope.modalLayersData.matrix[_j][_i] = value;
  }

  $scope.addLayer = function(_layerName){
    $scope.modalLayersData.layersNames.push( _layerName );

    var matrix = $scope.modalLayersData.matrix;
    //Create new arraw for matrix row
    var array = new Array();
    for(var j=0; j < matrix.length ;j ++)
      array.push(false)
    matrix.push( array );

    //We still have to add a new elements to columns 
    for( var i = 0; i < matrix.length; i++){
      matrix[i].push(false);
    }

    $scope.modalLayersData.matrix = matrix;
  }

  $scope.deleteLayer = function(_layerName){
    var index = $scope.getLayerIndex(_layerName);
    if( index < 0 )
      return;

    $scope.modalLayersData.layersNames.splice(index,1);

    var matrix = $scope.modalLayersData.matrix;
    //delete row of the layer
    matrix.splice(index, 1);
    //delete specific elements corresponding to this layer in the others
    for( var i = 0; i < matrix.length; i++){
      matrix[i].splice(index,1);
    }
  }

  $scope.checkMatrix = function(_matrix, _i, _j,_value){
    _matrix[_i][_j] = _value;
  }

  $scope.getMatrixValueByLayers = function(_layer1, _layer2){
    var i = $scope.getLayerIndex(_layer1);
    if( i < 0 )
      return false;
    var j = $scope.getLayerIndex(_layer2);
    if( j < 0 )
      return false;

    return $scope.modalLayersData.matrix[i][j];
  }

  //return the index of the layer
  $scope.getLayerIndex = function(_layerName){
    for(var i=0; i < $scope.modalLayersData.layersNames.length; i++){
      if( $scope.modalLayersData.layersNames[i] == _layerName ){
        return i;
      }
    }
    return -1;
  }

  main();
};