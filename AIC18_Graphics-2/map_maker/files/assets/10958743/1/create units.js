var CreateUnits = pc.createScript('createUnits');

CreateUnits.attributes.add('mid', {
    type: 'number',
    enum: [
        {'Attacker': 0},
        {'Defender': 1},
    ],
});

CreateUnits.attributes.add('light', {
    type: 'asset',
    assetType: 'model',
});

CreateUnits.attributes.add('heavy', {
    type: 'asset',
    assetType: 'model',
});

// initialize code called once per entity
CreateUnits.prototype.initialize = function() {
    var self = this;
    this.app.on('unitHandler:addNewUnit', function (mid, uid, type, lvl, health, loc, remtick, pid) {
        if(self.mid == mid) {
            self.addNewUnit(uid, type, lvl, health, loc, remtick, pid);
        }
    });
};

CreateUnits.prototype.addNewUnit = function(uid, type, lvl, health, loc, remtick, pid) {
    if(this.entity.findByName('unit ' + uid.toString()) === null) {
        this.addToMap(uid, type, lvl, health, loc, pid);
    }
};

CreateUnits.prototype.addToMap = function(uid, type, lvl, health, loc, pid) {
    var unit = new pc.Entity();
    unit.name = 'unit ' + uid.toString();
    
    
    unit.addComponent('model');
    unit.model.type = 'asset';
    if(type == 'l') {
        unit.model.asset = this.light;
    }
    else {
        unit.model.asset = this.heavy;
    }
    unit.setLocalPosition(this.getLocation(loc.y) + Math.random()*3 - 1.5, 0.7, this.getLocation(loc.x)+ Math.random()*3 - 1.5);
    this.entity.addChild(unit);
    
    unit.addComponent('script');
    unit.script.create('unitMove');
    
/*    var batch  = pc.BatchManager.prototype.getGroupByName('units');
    pc.BatchManager.prototype.register(batch,unit);*/
    
    //console.error('create unit : '+uid+'\n'+this.getLocation(loc.y));
};

CreateUnits.prototype.getLocation = function(x) {
    var size = (Math.sqrt(this.entity.parent.findByName('Ground').children.length));
    return -1.75 * size + 3.5 * x + 1.75;
};
