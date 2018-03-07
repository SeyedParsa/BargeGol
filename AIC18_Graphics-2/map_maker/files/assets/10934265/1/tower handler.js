var TowerHandler = pc.createScript('towerHandler');

TowerHandler.attributes.add('archer', {
    type: 'asset',
    assetType: 'model',
});

TowerHandler.attributes.add('cannon',{
    type: 'asset',
    assetType: 'model',
});

TowerHandler.attributes.add('blueTree',{
    type: 'asset',
    assetType: 'model',
});

TowerHandler.attributes.add('redTree',{
    type: 'asset',
    assetType: 'model',
});

// initialize code called once per entity
TowerHandler.prototype.initialize = function() {
    var self = this;
    //this.size = Math.sqrt(this.app.root.findByName('Attacker').findByName('Ground').children.length);
    
    this.app.on('logReader:createTower',function(mapid,towerid,lvl,type,loc){
        self.createTower(mapid,towerid,lvl,type,loc);
    });
    
    this.app.on('logReader:updateTower',function(mid,tid,lvl) {
        self.updateTower(mid,tid,lvl); 
    });
    
    this.app.on('logReader:cannonEvent',function(tid,loc){
        //console.error('cannon : '+tid+ ' : '+self.findTower(tid).parent.parent.name);
        self.cannonEvent(tid,loc);
    });
    
    this.app.on('logReader:archerEvent',function(tid,uid){
        //console.error('archer : '+tid+ ' : '+self.findTower(tid).parent.parent.name);
        self.archerEvent(tid,uid);
    });
};

// update code called every frame
TowerHandler.prototype.update = function(dt) {
    
};

TowerHandler.prototype.createTower = function(mapid,towerid,lvl,type,loc) {
    var tower = new pc.Entity();
    tower.name = 'tower'+towerid.toString();
    
    var parent;
    if(mapid === 0){
        parent = this.app.root.findByName('Attacker').findByName('Towers');
    }
    else if(mapid == 1){
        parent = this.app.root.findByName('Defender').findByName('Towers');
        //console.error('create : defender');
    }
    
    var size = Math.sqrt(parent.parent.findByName('Ground').children.length);

    tower.setPosition(this.convXY(loc.y,size), 0.5, this.convXY(loc.x,size));
    parent.addChild(tower);
    
    var model;
    if(type == 'c'){
        model = this.cannon;
        
    } else if(type == 'a'){
        model = this.archer;
    }
    tower.addComponent('model');
    tower.model.type = 'asset';
    tower.model.asset = model;
    
    tower.addComponent('script');
    tower.script.create('tower');
    tower.script.create('beanOnTower');
    
/*    var batch  = pc.BatchManager.prototype.getGroupByName('towers');
    pc.BatchManager.prototype.register(batch,tower);*/
};

TowerHandler.prototype.updateTower = function(mid,tid,lvl){
    var parent;
    if(mid === 0){
        parent = this.app.root.findByName('Attacker').findByName('Towers');
    }
    else {
        parent = this.app.root.findByName('Defender').findByName('Towers');
    }
    
    var tower = parent.findByName('tower'+tid.toString());
    tower.script.tower.levelUp(lvl);
};

TowerHandler.prototype.cannonEvent = function(tid,loc){
    var tower = this.findTower(tid);
    //console.error('cannon '+tower.parent.parent.name + ' : '+tid);
    //alert('cannon event : '+tid+' : '+tower.name);
    tower.script.tower.cannonShoot(loc);
};

TowerHandler.prototype.archerEvent = function(tid,uid){
    var tower = this.findTower(tid);
    //console.error('archer '+tower.parent.parent.name+ ' : '+tid);
    tower.script.tower.archerShoot(uid);
};

TowerHandler.prototype.findTower = function(tid){
    var parent1 = this.app.root.findByName('Attacker').findByName('Towers');
    var parent2 = this.app.root.findByName('Defender').findByName('Towers');
    var tower = parent1.findByName('tower'+tid.toString());
    if(tower !== null && tower !== undefined)
        return tower;
    tower = parent2.findByName('tower'+tid.toString());
    if(tower !== null && tower !== undefined)
        return tower;
    alert('not found');
    return null;
};


TowerHandler.prototype.convXY = function(index, size) {
    var conv = (-1.75 * size + 3.5 * index + 1.75); 
    return conv;
};