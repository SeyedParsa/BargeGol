var UiInput = pc.createScript('uiInput');

UiInput.attributes.add('hoverAsset', {
    type:'asset',
    assetType:'texture'
});

UiInput.attributes.add('activeAsset', {
    type:'asset',
    assetType:'texture'
});



// initialize code called once per entity
UiInput.prototype.initialize = function() {
    this.activeCamera = this.app.root.findByName('Main Camera');
    
    this.originalTexture = this.entity.element.textureAsset;
    
    this.hovered = false;
  
    this.entity.element.on('mouseenter', this.onEnter, this);
    this.entity.element.on('mousedown', this.onPress, this);
    this.entity.element.on('mouseup', this.onRelease, this);
    this.entity.element.on('mouseleave', this.onLeave, this); 
    
};

// update code called every frame
UiInput.prototype.update = function(dt) {
    
};

UiInput.prototype.onEnter = function (event) {  
    this.hovered = true;
    event.element.textureAsset = this.hoverAsset;
    
    // set our cursor to a pointer
    document.body.style.cursor = 'pointer';
};

// When the cursor leaves the element assign the original texture
UiInput.prototype.onLeave = function (event) {   
    this.hovered = false;
    event.element.textureAsset = this.originalTexture;
    
    // go back to default cursor
    document.body.style.cursor = 'default';
};

// When we press the element assign the active texture
UiInput.prototype.onPress = function (event) { 
    event.element.textureAsset = this.activeAsset;
    
    switch(this.entity.name){
        case 'btn_1':
            this.setCamera('Main Camera');
            break;
        
        case 'btn_2':
            this.setCamera('Camera 2');
            break;
            
        case 'btn_3':
            this.setCamera('Camera 3');
            break;
            
        case 'btn_4':
            this.setCamera('Camera 4');
            break;
            
        case 'btn_5':
            this.setCamera('Camera 5');
            break;
            
        case 'btn_6':
            this.setCamera('Camera 6');
            break;
        
        case 'btn_7':
            this.setCamera('Camera 7');
            break;
            
        case 'btn_8':
            this.setCamera('Camera 8');
            break;
            
        case 'btn_9':
            this.setCamera('Camera 9');
            break;
    }

};

// When we release the element assign the original texture if 
// we are not hovering or the hover texture if we are still hovering
UiInput.prototype.onRelease = function (event) {   
    event.element.textureAsset = this.hovered ? this.hoverAsset : this.originalTexture;
};


UiInput.prototype.setCamera = function(camera){
    this.activeCamera.enabled = false;

    this.activeCamera = this.app.root.findByName(camera);
    this.activeCamera.enabled = true;  
};
