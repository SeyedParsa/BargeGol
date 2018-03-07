var BeanOnNull = pc.createScript('beanOnNull');

BeanOnNull.attributes.add('side', {
    type: 'number',
    enum: [
        {'Attacker': 0},
        {'Defender': 1},
    ],
});

// initialize code called once per entity
BeanOnNull.prototype.initialize = function() {
    var self = this;
    var app = this.app;
    this.expand = false;
    this.run = false;
    this.smoke = null;
    this.redTree = this.app.assets.get(10794747);
    this.blueTree = this.app.assets.get(10886611);
    this.app.on('logReader:setBean', function(mid, loc) {
        if(mid == self.side) {
            var smoke = app.root.findByName('bean smoke');
            var pos = self.entity.getPosition();
            self.smoke = smoke.clone();
            self.entity.findByName('Ground').addChild(self.smoke);
            self.smoke.setLocalPosition(self.convXY(loc.y), 0.7, self.convXY(loc.x));
            self.smoke.particlesystem.play();
            self.run = true;
        }
    });
};

// update code called every frame
BeanOnNull.prototype.update = function(dt) {
    /*var scale = this.entity.getLocalScale();
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
    }*/
};

BeanOnNull.prototype.createNewTree = function(loc) {
    var tree = new pc.Entity();
    tree.addComponent('model');
    tree.model.type = 'asset';
    if(this.side === 0) {
        tree.model.asset = this.redTree;
    }
    else {
        tree.model.asset = this.blueTree;
    }
    tree.setPosition(this.convXY(loc.y), 0.7, this.convXY(loc.x));
    this.entity.findByName('Blocks').addChild(tree);
};

BeanOnNull.prototype.convXY = function(index) {
    var size = Math.sqrt(this.app.root.findByName('Ground').children.length);
    var conv = (-1.75 * size + 3.5 * index + 1.75); 
    return conv;
};
