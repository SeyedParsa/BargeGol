var LogReader = pc.createScript('logReader');

LogReader.attributes.add('log', {
    type: 'asset',
    assetType: 'json',
});

LogReader.attributes.add('attacker_statBar',{
   type: 'entity', 
});

LogReader.attributes.add('defender_statBar',{
   type: 'entity', 
});

window.setLog = function(log) {
    this.gameLog = log.resource;  
};

// initialize code called once per entity
LogReader.prototype.initialize = function() {
    this.counter = 0;
    this.time = 0;
    this.gameLog = this.log.resources;
};

// update code called every frame
LogReader.prototype.update = function(dt) {
    if(this.time % 13 === 0 && this.counter < this.gameLog.length && this.app.timeScale == 1){
        var data = this.gameLog[this.counter];
        if(data.name == 'init'){
            this.app.fire('logReader:init', data);
            this.initStats(data);
        }
        else if(data.name == 'turn') {
            this.setAttackerStats(data);
            this.setDefenderStats(data);
            this.createTowers(data);
            this.creatUnit(data);
            this.shootTowers(data);
            this.moveUnits(data);
            this.destroyTowers(data);
            this.sendStorm(data);
            this.sendBean(data);
            this.deadUnits(data);
            this.endOfPath(data);
        }
        else if(data.name == 'status'){
            this.app.fire('logReader:setTurnA',data.args[0]);
            this.app.fire('logReader:setTurnD',data.args[0]);
        }
        ++this.counter;
    }
    this.time++;
};

LogReader.prototype.initStats = function(data) {
    var params = data.args[0].params;
        var stats = {
        health : params[0],
        money : params[1],
        bean : params[3],
        storm : params[4],
        income : 0,
    };
    this.app.fire('logReader:statsBarA',stats);
    this.app.fire('logReader:setTurnA',0);
    this.app.fire('logReader:statsBarD',stats);
    this.app.fire('logReader:setTurnD',0);
};


LogReader.prototype.setAttackerStats = function (data){
    var player = data.args[0].players[0];
    var stats = {
        health : player[0],
        money : player[1],
        income : player[2],
        bean : player[3],
        storm : player[4],
    };
    this.app.fire('logReader:statsBarA',stats);
};

LogReader.prototype.setDefenderStats = function (data){
    var player = data.args[0].players[1];
    var stats = {
        health : player[0],
        money : player[1],
        income : player[2],
        bean : player[3],
        storm : player[4],
    };
    this.app.fire('logReader:statsBarD',stats);
};

LogReader.prototype.createTowers = function(data){
    //tower
    var newTowers = data.args[0].events.updtowers;
    for(var i = 0;i<newTowers.length;i++){
        var tower = newTowers[i];
        if(tower[3]) {
            var properties = this.getTowerProperties(data,tower[1]);
            //alert(JSON.stringify(properties));
            this.app.fire('logReader:createTower',tower[0],tower[1],tower[2],properties[0],properties[1]);   
        }
        else {
            this.app.fire('logReader:updateTower',tower[0],tower[1],tower[2]);
        }
    }

};

LogReader.prototype.shootTowers = function(data){
    var archers = data.args[0].events.archer;
    for(var i = 0;i< archers.length; i++){
        var archer = archers[i];
        //console.error('archer : '+archers[i][0]+' : '+JSON.stringify(archers[i][1]));
        this.app.fire('logReader:archerEvent',archer[0],archer[1]);
    }
    
    
    var cannons = data.args[0].events.cannon;
    for(i = 0;i< cannons.length; i++){
        var cannon = cannons[i];
        //console.error('cannon : '+cannons[i][0]+' : '+JSON.stringify(cannons[i][1]));
        this.app.fire('logReader:cannonEvent',cannon[0],cannon[1]);
    }
};

LogReader.prototype.destroyTowers = function(data){
    var destroyedTowers = data.args[0].events.destroyedtowers;
    for(i = 0;i<destroyedTowers.length;i++){
        var dTower = destroyedTowers[i];
        this.app.fire('logReader:destroyTower', dTower[0], dTower[1]);   
    }
};

LogReader.prototype.getTowerProperties = function(data,id){
    var tower,towers = data.args[0].towers;
    //alert(JSON.stringify(towers)+' : id='+id);
    for(var i=0;i < towers.length;i++){
        if(towers[i][1].toString() == id.toString()){
            tower =  [towers[i][2],towers[i][4]];
        }
    }
    //alert(JSON.stringify(tower));
    return tower;
};

LogReader.prototype.creatUnit = function(data) {
    var send = data.args;
    this.app.fire('logReader:unitData', send);
};

LogReader.prototype.moveUnits = function(data) {
    var send = data.args[0].units;
    this.app.fire('logReader:moveUnits', send);
};

LogReader.prototype.deadUnits = function(data) {
    var send = data.args[0].events.deadunits;
    this.app.fire('logReader:destroyUnit',send);
};

LogReader.prototype.sendStorm = function(data) {
    var send = data.args[0].events.storms;
    for(var i = 0; i < send.length; i++) {
        this.app.fire('logReader:sendStorm', send[i][0], send[i][1]);   
    }
};

LogReader.prototype.sendBean = function(data){
    var send = data.args[0].events.beans;
    for(var i = 0; i < send.length; i++) {
        this.app.fire('logReader:sendBean', send[i][0], send[i][1]);   
    }
};

LogReader.prototype.endOfPath = function(data){
    var send = data.args[0].events.endofpath;
    for(var i =0;i<send.length;i++){
        this.app.fire('logReader:endofpath',send[i][0],send[i][1]);
    }
};
