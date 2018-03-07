var AddPath = pc.createScript('addPath');

// initialize code called once per entity
AddPath.prototype.initialize = function() {
    this.entity.element.on('mouseup', this.onMouseUp, this);
    this.entity.element.on('mouseenter',function(){
        document.body.style.cursor = 'pointer';
    },this);
    this.entity.element.on('mouseleave', function(){
        document.body.style.cursor = 'default';
    }, this); 
};

// update code called every frame
AddPath.prototype.update = function(dt) {
    
};

AddPath.prototype.onMouseUp = function() {
    var newPath = this.app.root.findByName('New Path');

    var isEqual = false;
    var pathes = this.app.root.findByName('Full Path');
    
    //checking for similarities
    for(var i = 0;i<pathes.children.length;i++){
        if(pathes.children[i].children.length == newPath.children.length){
            var check = true;
            for(var j = 0;j < newPath.children.length;j++){
                if(newPath.children[j].getPosition().x != pathes.children[i].children[j].getPosition().x && newPath.children[j].getPosition().z != pathes.children[i].children[j].getPosition().z)
                {
                    check = false;
                    break;
                }
            }
            if(check === true){
                isEqual = true;
                break;
            }
        }
    }
    
    
    this.app.root.removeChild(newPath);
    if(isEqual === false){
        pathes.addChild(newPath);
        
//         var string = '';
    
//         for(i =0;i<newPath.children.length;i++){
//             var pos = newPath.children[i].getPosition();
//             string +=  pos.x+'--'+pos.z+'\n';
//         }

//         alert(string);
    }

    newPath.name = 'Done Path';
    newPath.enabled = false;
    this.app.root.findByName('path').enabled = false;
    this.app.root.findByName('done').enabled = false;
};

// swap method called for script hot-reloading
// inherit your script state here
// AddPath.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/