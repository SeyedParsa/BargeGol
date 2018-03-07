var Shoot = pc.createScript('shoot');

// initialize code called once per entity
Shoot.prototype.initialize = function() {
    
};

Shoot.newPosition = new pc.Vec3();

// update code called every frame
Shoot.prototype.update = function(dt) {
    var explode = this.explode;
    if (this.direction.lengthSq() > 0) {
        // Move in the direction at a set speed
        var d = this.speed * dt;
        var newPosition = Shoot.newPosition;
       
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
    else {
        if(explode !== null){
            var pos = this.entity.getLocalPosition();
            explode.setLocalPosition(pos.x, 1.5, pos.z);
            explode.particlesystem.reset();
            explode.particlesystem.play();
        }
        this.entity.destroy();
        
    }
};


Shoot.prototype.movePlayerTo = function (worldPosition,explode,smoke) {
    this.explode = explode;
    this.smoke = smoke;
    
    if(this.smoke !== null){
        this.smoke.particlesystem.reset();
        this.smoke.particlesystem.play();   
    }
    
    this.direction = new pc.Vec3();
    this.distanceToTravel = 0;
    this.targetPosition = new pc.Vec3();
    
    this.speed = 20;
    
    //console.error(JSON.stringify(worldPosition)+'\n'+this.entity.name);
    this.targetPosition.copy(worldPosition);
        
    // Assuming we are travelling on a flat, horizontal surface, we make the Y the same
    // as the player
    //this.entity.setPosition(entityPosition);

    this.distanceTravelled = 0;
    
    // Work out the direction that the player needs to travel in
    this.direction.sub2(this.targetPosition, this.entity.getLocalPosition());
    
    // Get the distance the player needs to travel for
    this.distanceToTravel = this.direction.length();
    //alert(this.targetPosition+' : '+this.entity.getPosition()+'\n'+this.distanceToTravel);
    
    if (this.distanceToTravel > 0) {
        // Ensure the direction is a unit vector
        this.direction.normalize();
        this.entity.lookAt(this.targetPosition);
    } else {
        this.direction.set(0, 0, 0);
    }
};
