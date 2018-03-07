var DynamicSize = pc.createScript('dynamicSize');

// initialize code called once per entity
DynamicSize.prototype.initialize = function() {
    var rock = this.app.root.findByName('dirt');
};

// update code called every frame
DynamicSize.prototype.update = function(dt) {
    
};

// swap method called for script hot-reloading
// inherit your script state here
// DynamicSize.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/