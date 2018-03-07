var BeanOnTower = pc.createScript('beanOnTower');

// initialize code called once per entity
BeanOnTower.prototype.initialize = function() {
    var self = this;
    var app = this.app;
    this.shrink = true;
    this.expand = false;
    this.run = false;
    this.smoke = null;
    this.redTree = this.app.assets.get(10794747);
    this.blueTree = this.app.assets.get(10886611);
    this.app.on('logReader:destroyTower', function(mid, tid) {
        if(self.entity.name == 'tower' + tid.toString()) {
            var smoke = app.root.findByName('bean smoke');
            var pos = self.entity.getPosition();
            self.smoke = smoke.clone();
            self.entity.addChild(self.smoke);
            self.smoke.setLocalPosition(0, 0, 0);
            self.smoke.particlesystem.play();
            self.run = true;
            self.mid = mid;
        }
    });
};

// update code called every frame
BeanOnTower.prototype.update = function(dt) {
    var scale = this.entity.getLocalScale();
    if(scale.y >= 0.01 && this.shrink && this.run) {
        this.entity.setLocalScale(scale.x - 1.3 * dt, scale.y - 1.3 * dt, scale.z - 1.3 * dt);
    }
    else if(this.shrink && this.run) {
        this.shrink = false;
        this.expand = true;
        if(this.mid === 0)
            this.entity.model.asset = this.redTree;
        else
            this.entity.model.asset = this.blueTree;
    }
    if(scale.y <= 1 && this.expand && this.run) {
        this.entity.setLocalScale(scale.x + 2 * dt, scale.y + 2 * dt, scale.z + 2 * dt);
    }
    else if(this.expand && this.run) {
        this.expand = false;
        this.entity.script.destroy('beanOnTower');
    }
};  
