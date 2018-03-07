var Init = pc.createScript('init');

Init.attributes.add('side', {
    type: 'entity',
});

Init.attributes.add('grassModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('earthModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('sandModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('waterModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('redTreeModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('blueTreeModel', {
    type: 'asset',
    assetType: 'model',
});

Init.attributes.add('rockModel', {
    type: 'asset',
    assetType: 'model',
});

// initialize code called once per entity
Init.prototype.initialize = function() {
    var self = this;
    this.app.on('logReader:init', function(json) {  
         self.makeFirstBase(json);
    });
};

Init.prototype.makeFirstBase = function(json){
    var content = this.getMapString(json);
    var camera = this.side.findByName('Camera');
    camera.camera.orthoHeight = 3 * this.getSize(json);
    this.drawMap(json,content);
};

Init.prototype.drawMap = function(json,content) {
    var ground = this.side.findByName('Ground');
    var blocks = this.side.findByName('Blocks');
    
    for(var index = 0; index < content.length; index++) {
        var x = this.getXZ(json,index)[0];
        var z = this.getXZ(json,index)[1];
        if(content[index] == 'g') {
            if(this.side.name == 'Attacker') {
                this.addToMap("sand", this.sandModel, ground, x, 0, z);   
            }
            else {
                this.addToMap("water", this.waterModel, ground, x, 0, z);
            }
        }
        else if(content[index] == 'r') {
            this.clearXZ(x, z);
            this.addToMap("road", this.earthModel, ground, x, 0, z);
        }
        else if(content[index] == 'w') {
            if(this.side.name == 'Attacker') {
                this.addToMap("sand", this.sandModel, ground, x, 0, z);   
            }
            else {
                this.addToMap("water", this.waterModel, ground, x, 0, z);
            }
        }
        else {
            if(content[index] == 'A') {
                this.clearXZ(x, z);
                if(this.side.name == 'Attacker') {
                    this.addToMap("sand", this.sandModel, ground, x, 0, z);
                    this.addToMap("red tree",this.redTreeModel, blocks, x, 0.705, z);
                }
                else {
                    this.addToMap("water", this.waterModel, ground, x, 0, z);
                    this.addToMap("blue tree",this.blueTreeModel, blocks, x, 0.705, z);
                }
            }
            else if(content[index] == 'B' || content[index] == 'b') {
                this.clearXZ(x, z);
                if(this.side.name == 'Attacker') {
                    this.addToMap("sand", this.sandModel, ground, x, 0, z);   
                }
                else {
                    this.addToMap("water", this.waterModel, ground, x, 0, z);
                }
                this.addToMap('rock', this.rockModel, blocks, x, 0.705, z);
            }
        }
    }
};

Init.prototype.getSize = function(json) {
    return json.args[0].map.size[0];
};

Init.prototype.getMapString = function(json) {
    var content = json.args[0].map.cells;
    var map = "";
    for(var i = 0; i < content.length; i++) {
        map += content[i];
    }
    return map;
};



Init.prototype.addToMap = function(name, model, parent, x, y, z) {
    var add = new pc.Entity();
    add.name = name;
    add.addComponent('model');
    add.model.type = 'asset';
    add.model.asset = model;
    add.setPosition(x, y, z);
    parent.addChild(add);
/*    var batch = pc.BatchManager.prototype.getGroupByName('ground');
    //var batch = pc.BatchManager.prototype.prepare()
    pc.BatchManager.prototype.register(batch,[add]);*/
};

Init.prototype.getXZ = function(json,index) {
    var size = this.getSize(json);
    var i = Math.floor(index / size);
    var j = index % size;
    var x = -1.75 * size + 3.5 * i + 1.75;
    var z = -1.75 * size + 3.5 * j + 1.75;
    return [x, z];
};

Init.prototype.clearXZ = function(x, z) {
    var blocks = this.app.root.findByName('Blocks').children;
    for(var i = 0; i < blocks.length; i++) {
        if(blocks[i].getPosition().x == x && blocks[i].getPosition().z == z) {
            blocks[i].destroy();
            break;
        }
    }
};
