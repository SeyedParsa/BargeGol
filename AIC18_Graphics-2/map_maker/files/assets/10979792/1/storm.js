var Storm = pc.createScript('storm');

// initialize code called once per entity
Storm.prototype.initialize = function() {
    var self = this;
    this.app.on('logReader:sendStorm', function(mid, loc) {
        self.sendStorm(mid, loc);
    });
};

Storm.prototype.sendStorm = function(mid, loc) {
    var storm = this.app.root.findByName('storm');
    var newStorm = storm.clone();
    if(mid === 0) {
        this.app.root.findByName('Attacker').addChild(newStorm);
    }
    else {
        this.app.root.findByName('Defender').addChild(newStorm);
    }
    newStorm.setLocalPosition(this.convXY(loc.x), 1.5, this.convXY(loc.y));
    newStorm.particlesystem.play();
};

Storm.prototype.convXY = function(index) {
    var size = Math.sqrt(this.app.root.findByName('Ground').children.length);
    var conv = (-1.75 * size + 3.5 * index + 1.75); 
    return conv;
};
