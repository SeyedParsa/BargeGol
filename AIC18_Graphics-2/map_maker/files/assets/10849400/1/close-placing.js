var ClosePlacing = pc.createScript('closePlacing');

ClosePlacing.attributes.add('hoverAsset', {
    type:'asset',
    assetType:'texture'
});

ClosePlacing.attributes.add('activeAsset', {

    type:'asset',
    assetType:'texture'
});

// initialize code called once per entity
ClosePlacing.prototype.initialize = function() {
    this.originalTexture = this.entity.element.textureAsset;
    this.hovered = false;

    this.entity.element.on('mouseenter', this.onEnter, this);

    this.entity.element.on('mousedown', this.onPress, this);

    this.entity.element.on('mouseup', this.onRelease, this);

    this.entity.element.on('mouseleave', this.onLeave, this); 
};

ClosePlacing.prototype.update = function(dt) {

};

ClosePlacing.prototype.onPress = function(event){
    event.element.textureAsset = this.activeAsset;
    var models = this.app.root.findByName('model holder').children;

    for(var i = 0; i < models.length; i++) {
        models[i].enabled = false;
    }
    
    this.app.root.findByName('done').enabled = false;
    var newPath = this.app.root.findByName('New Path');
    if(newPath !== null && newPath !== undefined){
        newPath.enabled = false;
        this.app.root.removeChild(newPath);
    }   
    
    var camera = this.app.root.findByName('Main Camera');
    camera.script.mouseInput.runable = true;
    
    var groundHolder = this.app.root.findByName('Ground Holder');
    groundHolder.script.makeGround.removeMode = false;
};

ClosePlacing.prototype.onEnter = function (event) {  
    this.hovered = true;
    event.element.textureAsset = this.hoverAsset;
    document.body.style.cursor = 'pointer';
};

ClosePlacing.prototype.onLeave = function (event) {   
    this.hovered = false;
    event.element.textureAsset = this.originalTexture;
    document.body.style.cursor = 'default';
};

ClosePlacing.prototype.onRelease = function (event) {   
    event.element.textureAsset = this.hovered ? this.hoverAsset : this.originalTexture;

};
