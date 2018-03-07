var MakeGround = pc.createScript('makeGround');

MakeGround.attributes.add('greenModel', {
    type: 'asset',
    assetType: 'model',
});

MakeGround.attributes.add('earthModel', {
    type: 'asset',
    assetType: 'model',
});

MakeGround.attributes.add('waterModel', {
    type: 'asset',
    assetType: 'model',
});

MakeGround.attributes.add('treeModel', {
    type: 'asset',
    assetType: 'model',
});

MakeGround.attributes.add('stoneModel', {
    type: 'asset',
    assetType: 'model',
});

MakeGround.attributes.add('map', {
    type: 'number',
    default: 10,
    min: 10,
    max: 25,
    precision: 10,
});

Object.defineProperty(MakeGround.prototype,"table",{
   value : [],
    writable : true,
});

var ground = new Array(0);

// initialize code called once per entity
MakeGround.prototype.initialize = function() {    
    this.camera = this.app.root.findByName('Camera');
    
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseUp, this);
    
    var size = prompt("Please enter your map size", "20");
    if (size !== null) {
        this.map = size;
        var modelHolder = this.app.root.findByName('model holder');
        for(var i=0;i < modelHolder.children.length;i++){
            modelHolder.children[i].script.followMouse.map = size;
        }
        var camera = this.app.root.findByName('Main Camera');
        camera.script.orthoHeight.map = size;
        this.app.fire('makeGround:ortho');
    }
    
    this.setFirstGround();
};

MakeGround.prototype.setFirstGround = function() {
    var x, y;
    var groundHolder = this.app.root.findByName('Ground Holder');
    var start = -1.75 * this.map;
    var end = 1.75 * this.map;
    for(x = start; x < end; x += 3.5) {
        var string = '';
        for(y = start; y < end; y += 3.5) {
            var green = new pc.Entity();
            green.name = 'green block';
            green.addComponent('model');
            green.model.type = 'asset';
            green.model.asset = this.greenModel;
            green.setPosition(x, 0, y);
            groundHolder.addChild(green);
            var info = new pc.Vec4(0, x, y, 0);
            ground.push(info);
            string+='g';
        }
        this.table.push(string);
    }
};

MakeGround.prototype.setGround = function(index,x,y) {
    String.prototype.replaceAt=function(index, replacement) {
        return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
    };
    
    var groundHolder = this.app.root.findByName('Ground Holder');
    
    var i,model,models = this.app.root.findByName('model holder').children;
    for(i = 0;i < models.length;i++){
        if(models[i].enabled === true){
            model = models[i];
            break;
        }
    }
    
    
    switch(model.name){
        case 'dirt':
            if(ground[index].w === 0) {
                this.table[x] = this.table[x].replaceAt(y, "r");
                ground[index].x = 1;
                groundHolder.children[index].name = 'earth block';
                groundHolder.children[index].model.asset = this.earthModel;
            }
            break;
            
        case 'grass':
            this.table[x] = this.table[x].replaceAt(y, "g");
            ground[index].x = 0;
            groundHolder.children[index].name = 'green block';
            groundHolder.children[index].model.asset = this.greenModel;
            break;
            
        case 'water':
            if(ground[index].w === 0) {
                this.table[x] = this.table[x].replaceAt(y, "w");
                ground[index].x = 2;
                groundHolder.children[index].name = 'water block';
                groundHolder.children[index].model.asset = this.waterModel;
            }
            break;
            
        case 'tree':
            var tree = new pc.Entity();
            tree.name = 'tree block';
            tree.addComponent('model');
            tree.model.type = 'asset';
            tree.model.asset = this.treeModel;
            tree.setPosition(ground[index].y, 0.687, ground[index].z);
            if(ground[index].x === 0 && ground[index].w === 0) {
                ground[index].w = 1;
                this.app.root.addChild(tree);
                this.table[x] = this.table[x].replaceAt(y, "A");
            }
            break;
            
        case 'stone':
            var stone = new pc.Entity();
            stone.name = 'stone block';
            stone.addComponent('model');
            stone.model.type = 'asset';
            stone.model.asset = this.stoneModel;
            stone.setPosition(ground[index].y, 0.687, ground[index].z);
            if(ground[index].x === 0 && ground[index].w === 0) {
                ground[index].w = 2;
                this.app.root.addChild(stone);
                this.table[x] = this.table[x].replaceAt(y, "B");
            }
            break;
            
        case 'path':
            var path = new pc.Entity();
            path.name = 'path block';
            path.addComponent('model', {type: 'plane',});
            path.setLocalScale(3.5, 1, 3.5);
            path.setPosition(ground[index].y, 0.71, ground[index].z);
            if(ground[index].x == 1 && ground[index].w === 0) {
                var newPath = this.app.root.findByName('New Path');
                if(!this.checkForRepetition(newPath,path))
                    newPath.addChild(path);
            }
            break;
            
        case 'eraser' :
            if(this.table[x][y] == 'A' || this.table[x][y] == 'B'){
                this.table[x] = this.table[x].replaceAt(y, "g");
                ground[index].x = 1;
                ground[index].w = 0;
                var extensions = this.app.root.find('name', 'tree block');
                extensions.push.apply(extensions,this.app.root.find('name', 'stone block'));
                var pos = new pc.Vec3(ground[index].y, 0.687, ground[index].z);

                for(i = 0;i < extensions.length;i++){                    
                    if(extensions[i].getPosition().x == pos.x && extensions[i].getPosition().z == pos.z){
                        extensions[i].destroy();
                        break;
                    }
                }
            }
            break;
    }
};

MakeGround.prototype.checkForRepetition = function(newPath,path){
    var bool = false;
    for(var i=0;i<newPath.children.length;i++){
        if(newPath.children[i].getPosition().x == path.getPosition().x && newPath.children[i].getPosition().z == path.getPosition().z)
            bool = true;
    }
    return bool;
};

MakeGround.prototype.onMouseUp = function(event) {
    var models = this.app.root.findByName('model holder').children;
    var earth;
    for(var i = 0; i < models.length; i++) {
        if(models[i].enabled === true) {
            earth = models[i];
            break;
        }
    }

    if(earth !== null && earth !== undefined) {
        var x = earth.getPosition().x + 1.75 * this.map;
        var y = earth.getPosition().z + 1.75 * this.map;
        i = x / 3.5;
        var j = y / 3.5;
        i = i - i % 1;
        j = j - j % 1;
        var index = i * this.map + j;
        if(i >= 0 && j >= 0 && i < this.map && j < this.map) {
            this.setGround(index,i,j);
        }
    }
};
