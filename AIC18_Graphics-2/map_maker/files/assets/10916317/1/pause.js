var Pause = pc.createScript('pause');

Object.defineProperty(Pause.prototype,"isPaused",{
    value : false,
    writable : true,
});

// initialize code called once per entity
Pause.prototype.initialize = function() {
    this.isPaused = false;
};

// update code called every frame
Pause.prototype.update = function(dt) {
    if (this.app.mouse.wasPressed (pc.MOUSEBUTTON_LEFT)) {
        this.togglePaused ();
    }
};

Pause.prototype.togglePaused = function () {
    // More information about app.timeScale http://developer.playcanvas.com/en/api/pc.Application.html#timeScale
    // app.timeScale is global and affects the value of dt that is passed into the update functions
    
    if(!this.isPaused) {
        // var resume = this.app.root.findByName('resume');
        // resume.enabled = true;
        this.app.timeScale = 0;
    }else {
        this.app.timeScale = 1;
    }
    
    this.isPaused = !this.isPaused;
};