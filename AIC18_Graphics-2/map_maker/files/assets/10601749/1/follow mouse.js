var FollowMouse = pc.createScript("followMouse");

FollowMouse.attributes.add('map', {
    type: 'number',
    default: 10,
    min: 10,
    max: 25,
});

// initialize code called once per entity
FollowMouse.prototype.initialize = function() {
    this.pos = new pc.Vec3();
    
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

};

FollowMouse.prototype.update = function(dt) {
    var cube = this.entity;
    if(cube.getPosition().x >= -1.75 * this.map && cube.getPosition().x < 1.75 * this.map && cube.getPosition().z >= -1.75 * this.map && cube.getPosition().z < 1.75 * this.map) {
        if(this.entity.name == 'path') {
            cube.setLocalScale(3.5, 1, 3.5);
        }
        else {
            cube.setLocalScale(1, 1, 1);
        }
    } else {
        cube.setLocalScale(0, 0, 0);
    }
};

FollowMouse.prototype.onMouseMove = function (event) {
    var newPos = this.positioning(event);
    this.entity.setPosition(newPos);
};

FollowMouse.prototype.modFunc = function(x, m) {
    return x - x % m;
};

FollowMouse.prototype.positioning = function(event){
    var cvr = Math.PI / 180;
    
    var depth = 10;
    var cameraEntity = this.app.root.findByName('Main Camera');
    cameraEntity.camera.screenToWorld(event.x, event.y, depth, this.pos);

    var x =  this.pos.x, y = this.pos.y, z = this.pos.z;
    var tx = cameraEntity.getEulerAngles().x * cvr, ty = cameraEntity.getEulerAngles().y * cvr, tz = cameraEntity.getEulerAngles().z * cvr;
    var nx = Math.cos(tx) * Math.sin(ty) * Math.cos(tz) + Math.sin(tx) * Math.sin(tz);
    var ny = Math.cos(tx) * Math.sin(ty) * Math.sin(tz) - Math.sin(tx) * Math.cos(tz);
    var nz = Math.cos(tx) * Math.cos(ty);
    var x0 = x - y * nx / ny;
    var z0 = z - y * nz / ny;
    var newPos;
    newPos = new pc.Vec3(this.modFunc(x0, 3.5), 0.71, this.modFunc(z0, 3.5));
    
    return newPos;
};
