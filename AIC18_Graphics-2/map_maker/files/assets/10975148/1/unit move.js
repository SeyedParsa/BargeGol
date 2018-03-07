var UnitMove = pc.createScript('unitMove');

// initialize code called once per entity
UnitMove.prototype.initialize = function() {
    //this.groundShape = new pc.BoundingBox(new pc.Vec3(0, 0, 0), new pc.Vec3(4, 0.001, 4));
    this.direction = new pc.Vec3();
    this.distanceToTravel = 0;
    this.targetPosition = new pc.Vec3();
    
    this.speed = 4;
};

UnitMove.newPosition = new pc.Vec3();

// update code called every frame
UnitMove.prototype.update = function(dt) {
    if (this.direction.lengthSq() > 0) {
        // Move in the direction at a set speed
        var d = this.speed * dt;
        var newPosition = UnitMove.newPosition;
       
        newPosition.copy(this.direction).scale(d);
        newPosition.add(this.entity.getLocalPosition()); 
        this.entity.setLocalPosition(newPosition); 
        
        this.distanceToTravel -= d;
        
        // If we have reached our destination, clamp the position 
        // and reset the direction
        if (this.distanceToTravel <= 0) {
            this.entity.setLocalPosition(this.targetPosition);
            this.direction.set(0, 0, 0);
        }
    }
};


UnitMove.prototype.movePlayerTo = function (worldPosition) {
    //console.error(JSON.stringify(worldPosition)+'\n'+this.entity.name);
    this.targetPosition.copy(worldPosition);
        
    // Assuming we are travelling on a flat, horizontal surface, we make the Y the same
    // as the player
    //this.entity.setPosition(entityPosition);
    this.targetPosition.y = this.entity.getLocalPosition().y;

    this.distanceTravelled = 0;
    
    // Work out the direction that the player needs to travel in
    this.direction.sub2(this.targetPosition, this.entity.getLocalPosition());
    
    // Get the distance the player needs to travel for
    this.distanceToTravel = this.direction.length();
    //alert(this.targetPosition+' : '+this.entity.getPosition()+'\n'+this.distanceToTravel);
    
    if (this.distanceToTravel > 0) {
        // Ensure the direction is a unit vector
        this.direction.normalize();
        this.entity.lookAt(this.targetPosition,this.entity.up);
    } else {
        this.direction.set(0, 0, 0);
    }
};
