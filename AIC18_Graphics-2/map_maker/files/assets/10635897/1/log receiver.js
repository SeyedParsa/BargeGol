var Game = pc.createScript('Game');

Game.attributes.add('hoverAsset', {
    type:'asset',
    assetType:'texture'
});

Game.attributes.add('activeAsset', {

    type:'asset',
    assetType:'texture'
});

// initialize code called once per entity
Game.prototype.initialize = function() {
    this.originalTexture = this.entity.element.textureAsset;
    this.hovered = false;
    
    this.entity.element.on('mouseup',this.onRelease,this);
    
    this.entity.element.on('mouseenter', this.onEnter, this);

    this.entity.element.on('mousedown', this.onPress, this);

    this.entity.element.on('mouseleave', this.onLeave, this); 

};

// update code called every frame
Game.prototype.update = function(dt) {
    
};

Game.prototype.onRelease = function(event){
    event.element.textureAsset = this.hovered ? this.hoverAsset : this.originalTexture;
     var retVal = confirm("Do you want to continue ?");
     if( retVal === true ){
        
         var groundHolder = this.app.root.findByName('Ground Holder');
         var x = groundHolder.script.makeGround.map;
         var y = x;
         
         var pathes = [];
         var fullPath = this.app.root.findByName('Full Path');
         var pathEntities = fullPath.children;

         
         for(var i = 0;i<pathEntities.length;i++){
             var pathChilds = pathEntities[i].children;
             var cells = [];
             for(var j =0;j < pathChilds.length;j++){
                var x_index = (pathChilds[j].getPosition().x + 1.75 * x) / 3.5;
                var y_index = (pathChilds[j].getPosition().z + 1.75 * y) / 3.5;
                x_index = x_index - x_index % 1;
                y_index = y_index - y_index % 1;
                 var cell = {
                     x : y_index,
                     y : x_index
                 };
                 cells.push(cell);
             }
             var path = {
                 len : pathChilds.length,
                 cells : cells
             };
             pathes.push(path);
         }
         
         
         var table = groundHolder.script.makeGround.table;
         var params = [
            50,
            2000,
            1000,
            3,
            3,
            2,
            [
                [
                    40,
                    16,
                    32,
                    1.3,
                    8,
                    2,
                    2,
                    1,
                    2,
                    60,
                    3
                ],
                [
                    180,
                    60,
                    240,
                    1.3,
                    25,
                    8,
                    4,
                    5,
                    2,
                    15,
                    10
                ]
            ],
            [
                [
                    150,
                    50,
                    1.5,
                    40,
                    1.4,
                    3,
                    2,
                    0
                ],
                [
                    200,
                    70,
                    1.5,
                    10,
                    1.4,
                    4,
                    2,
                    0
                ]
            ]
        ];
             
         var map = {
             size : [x,y],
             cells : table
         };
         var args = {map:map,paths:pathes,params:params};
         var request = [args];
         var string = JSON.stringify(request);
         
         // Start file download.
        this.download("map.map",string);
         
         //sending json to server
         var xhr = new XMLHttpRequest();
         xhr.open('GET', "", true);
         //xhr.send(string);
     }
     else{      
         
     }
     
};

Game.prototype.download = function(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};



Game.prototype.onEnter = function (event) {  
    this.hovered = true;
    event.element.textureAsset = this.hoverAsset;
    document.body.style.cursor = 'pointer';
};

Game.prototype.onLeave = function (event) {   
    this.hovered = false;
    event.element.textureAsset = this.originalTexture;
    document.body.style.cursor = 'default';
};

Game.prototype.onPress = function(event){
    event.element.textureAsset = this.activeAsset;  
};
