var RotateTower = pc.createScript('rotateTower');

// initialize code called once per entity
RotateTower.prototype.initialize = function() {
    var rotation = this.entity.getEulerAngles();
    this.base = new pc.Vec3(Math.sin(rotation.y * Math.PI / 180), 0, Math.cos(rotation.y * Math.PI / 180));
    var to = new pc.Vec3(0, 1, 0);
    this.rotate = this.findAngle(this.direction(to));
    this.rotated = 0;
    
    this.entity.lookAt(to);
    //alert(Math.abs(this.rotate));
    //alert(this.entity.getRotation());
};

// update code called every frame
RotateTower.prototype.update = function(dt) {
    //var rotate = this.entity.getRotation();
    /*if(this.rotated < Math.abs(this.rotate)) {
        console.log(rotate.y);*/
        //var sign = 10 * this.rotate / Math.abs(this.rotate);
        //console.log(sign * dt);
        //this.entity.setRotation(0, rotate.y + 10 * dt, 0);
    //}
};

RotateTower.prototype.findAngle = function(to) {
    var rotate = Math.acos(this.base.dot(to.normalize())) * 180 / Math.PI;
    rotate = this.base.x < 0 ? rotate : -rotate;
    return rotate;
};

RotateTower.prototype.direction = function(end) {
    var normal = new pc.Vec3(1, 0, 1).normalize();
    var r = new pc.Vec3();
    r.sub2(end, this.entity.getPosition());
    r.y = 0;
    return r;
};
