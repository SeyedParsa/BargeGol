var UnitHandler = pc.createScript('unitHandler');

// initialize code called once per entity
UnitHandler.prototype.initialize = function() {
    var self = this;
    this.app.on('logReader:unitData', function(source) {
        self.addNewUnit(source[0]);
    });
    
    this.app.on('logReader:moveUnits',function(source){
        self.move(source);
    });
    
    this.app.on('logReader:destroyUnit',function(source){
        self.destroyUnit(source);
    });
    
    this.app.on('logReader:endofpath',function(mid,uid){
        self.endofpath(mid,uid); 
    });
};

// update code called every frame
UnitHandler.prototype.update = function(dt) {
    
};

UnitHandler.prototype.addNewUnit = function(source) {
    var newUnits = source.events.newunits;
    for(var i = 0; i < newUnits.length; i++) {
        var unit = newUnits[i];
        this.app.fire('unitHandler:addNewUnit', unit[0], unit[1][0], unit[1][1], unit[1][2], unit[1][3], unit[1][4], unit[1][5], unit[1][6]);
    }
};

UnitHandler.prototype.move = function(source){
      for(var i = 0; i < source.length; i++) {
        var ui = source[i];
        var id = ui[1];
        var loc = ui[5];
        var health = ui[4];
        var maxhealth = ui[8];
        var unit = this.entity.findByName('unit ' + id.toString());
        if(unit !== null && unit !== undefined) {
            var pos = new pc.Vec3(this.getLocation(loc.y) + Math.random() * 3 - 1.5, 0.7, this.getLocation(loc.x)+ Math.random()*3 - 1.5);
            unit.script.unitMove.movePlayerTo(pos);
            var scale = health/maxhealth;
            unit.setLocalScale(unit.getLocalScale().x * scale,unit.getLocalScale().y * scale,unit.getLocalScale().z * scale);
        }
    }
};

UnitHandler.prototype.destroyUnit = function(source){
    var deadUnits = source;
    for(var i = 0; i < deadUnits.length; i++) {
        var uid = deadUnits[i][1];
        var unit = this.entity.findByName('unit '+uid.toString());
        if(unit !== null && unit !== undefined){
            unit.destroy();
            //alert('destroy : '+unit.name);
        }
    }
};

UnitHandler.prototype.endofpath = function(mid,uid){
    var unit = this.entity.findByName('unit '+uid.toString());
    if(unit !== null && unit !== undefined){
        unit.destroy();
    }
};

UnitHandler.prototype.getLocation = function(x) {
    var size = (Math.sqrt(this.entity.parent.findByName('Ground').children.length));
    return -1.75 * size + 3.5 * x + 1.75;
};