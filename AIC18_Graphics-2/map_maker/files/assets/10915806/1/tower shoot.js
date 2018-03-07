var Tower = pc.createScript('tower');

// initialize code called once per entity
Tower.prototype.initialize = function() {
    this.lvl = 1;
    this.changeTo = null;
    this.shrink = false;
    this.expand = false;
    this.run = false;
};

// update code called every frame
Tower.prototype.update = function(dt) {
    var scale = this.entity.getLocalScale();
    if(scale.y >= 0.01 && this.shrink && this.run) {
        this.entity.setLocalScale(scale.x - 8 * dt, scale.y - 8 * dt, scale.z - 8 * dt);
    }
    else if(this.shrink && this.run) {
        this.shrink = false;
        this.expand = true;
        this.entity.model.asset = this.changeTo;
    }
    if(scale.y <= 1 && this.expand && this.run) {
        this.entity.setLocalScale(scale.x + 8 * dt, scale.y + 8 * dt, scale.z + 8 * dt);
    }
    else if(this.expand && this.run) {
        this.expand = false;
        this.run = false;
    }
};

Tower.prototype.archerShoot = function (uid) {
    var unit = this.entity.parent.parent.findByName('Units').findByName('unit ' + uid.toString());
    var bullet = this.entity.parent.parent.findByName('arrow');
    this.bullet = bullet.clone();
    this.bullet.setLocalPosition(0,3.4,0.5);
    this.bullet.enabled = true;
    this.entity.addChild(this.bullet);
    
    var pos = unit.getPosition();
    this.entity.lookAt(pos);
    
    var smoke = this.entity.parent.parent.findByName('smoke');
    this.aSmoke = smoke.clone();
    this.aSmoke.enabled = true;
    this.entity.addChild(this.aSmoke);
    
    // this.aSmoke.setLocalPosition(this.aSmoke.getLocalPosition().x,this.aSmoke.getLocalPosition().y + (this.lvl - 1) *1.2,this.aSmoke.getLocalPosition().z);
    // this.aSmoke.particlesystem.reset();
    // this.aSmoke.particlesystem.play();
    
    //this.bullet.script.shoot.movePlayerTo(localPos,null,null);
    //this.bullet.script.moveBullet.createPath(this.entity,unit,null);
};

Tower.prototype.cannonShoot = function(loc){
    var smoke = this.entity.parent.parent.findByName('smoke');
    this.smoke = smoke.clone();
    this.smoke.enabled = true;
    this.entity.addChild(this.smoke);
    
    var explode = this.entity.parent.parent.findByName('explosion');
    this.explode = explode.clone();
    this.explode.enabled = true;
    this.entity.addChild(this.explode);
    
    
//     var bullet = this.entity.parent.parent.findByName('bullet');
//     this.bullet = bullet.clone();
//     this.bullet.setLocalPosition(0,3.1,1);
//     this.bullet.enabled = true;
//     this.entity.addChild(this.bullet);
    
    var size = Math.sqrt(this.entity.parent.parent.findByName('Ground').children.length);
    var pos = new pc.Vec3(this.convXY(loc.y,size),1,this.convXY(loc.x,size));
    
    var tolerance;
    if(this.entity.parent.parent.name == 'Attacker')
        tolerance = -200;
    else
        tolerance = +200;
    var lookTo = new pc.Vec3(-1*this.convXY(loc.x,size) + tolerance,1,-1 * this.convXY(loc.y,size));
    
    this.smoke.setLocalPosition(0.1,3.1 + (this.lvl - 1) *1.2,-1.3);
    this.smoke.particlesystem.reset();
    this.smoke.particlesystem.play();
    this.entity.lookAt(lookTo);
    
    // this.explode.setPosition(pos);
    // this.explode.particlesystem.reset();
    // this.explode.particlesystem.play();
    
};

Tower.prototype.levelUp = function(lvl){
    this.lvl = lvl;
    console.log(this.lvl);
    if(this.lvl <= 3) {

    }
    else if(this.lvl <= 6) {
        if(this.entity.model.asset == 10980435) {
            this.changeTo = this.app.assets.get(10980439);
            this.run = true;
            this.shrink = true;
        }
        else {
            this.changeTo = this.app.assets.get(10980476);
            this.run = true;
            this.shrink = true;
        }
    }
    else if(this.lvl <= 9) {
        if(this.entity.model.asset == 10980439) {
            this.changeTo = this.app.assets.get(10980443);
            this.run = true;
            this.shrink = true;
        }
        else {
            this.changeTo = this.app.assets.get(10980480);
            this.run = true;
            this.shrink = true;
        }
    }
    else {
        if(this.entity.model.asset == 10980443) {
            this.changeTo = this.app.assets.get(10980448);
            this.run = true;
            this.shrink = true;
        }
        else {
            this.changeTo = this.app.assets.get(10980484);
            this.run = true;
            this.shrink = true;
        }
    }
};

Tower.prototype.convXY = function(index, size) {
    var conv = (-1.75 * size + 3.5 * index + 1.75); 
    return conv;
};
