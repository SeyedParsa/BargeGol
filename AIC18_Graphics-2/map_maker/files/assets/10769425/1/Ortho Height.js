var OrthoHeight = pc.createScript('orthoHeight');

OrthoHeight.attributes.add('map', {
    type: 'number',
    default: 10,
    min: 10,
    max: 45,
});

// initialize code called once per entity
OrthoHeight.prototype.initialize = function() {
    var self = this;
    this.app.on('makeGround:ortho',function(){ 
        self.setOrtho();
    });
};

OrthoHeight.prototype.setOrtho = function(){
    var camera = this.app.root.findByName('Main Camera');
    camera.camera.orthoHeight = 2.3 * this.map;  
};
