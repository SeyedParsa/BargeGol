var Resume = pc.createScript('Resume');

Resume.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});
Resume.attributes.add('rsm_html', {type: 'asset', assetType:'html', title: 'HTML Asset'});


// initialize code called once per entity
Resume.prototype.initialize = function() {
    var style = document.createElement('style');

    // append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';
    
    this.btndiv = document.createElement('div');
    this.btndiv.classList.add('resume');
    this.btndiv.innerHTML = this.rsm_html.resource || '';
    document.body.appendChild(this.btndiv);
    
    
    //this.bindEvents();
};

// update code called every frame
Resume.prototype.update = function(dt) {
    var btn = this.btndiv.querySelector('#button');
    var app = this.app;
    
    btn.addEventListener('click',function(){
        var attacker = app.root.findByName('Attacker');
        var defender = app.root.findByName('Defender');
        app.timeScale = 1;
        
        attacker.script.pause.isPaused = false;
        defender.script.pause.isPaused = false;
        app.root.findByName('resume').enabled = false;
    },false);
};
