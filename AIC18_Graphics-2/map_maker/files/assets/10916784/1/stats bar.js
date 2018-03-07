var StatsBar = pc.createScript('statsBarA');

StatsBar.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});
StatsBar.attributes.add('bar_html', {type: 'asset', assetType:'html', title: 'HTML Asset'});
StatsBar.attributes.add('log', {type: 'asset',assetType: 'json',});

// initialize code called once per entity
StatsBar.prototype.initialize = function() {
    this.suffix = 'A';
    
    var style = document.createElement('style');

    // append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';
    
    // Add the HTML
    this.div = document.createElement('div');
    this.div.classList.add('container'+this.suffix);
    this.div.innerHTML = this.bar_html.resource || '';

    document.body.appendChild(this.div);
    
    this.timer = 0;
    
    var self = this;
    this.app.on('logReader:statsBarA', function(stats) {    
         self.statusUpdate(stats);
    });
    this.app.on('logReader:setTurnA', function(turn) {    
         self.setTurn(turn);
    });
    
};

StatsBar.prototype.update = function(dt) {
    // if(this.app.timeScale == 1)
    //     this.timer += 1;
    // if(this.timer % 4 === 0)
    //     this.div.querySelector('#time'+this.suffix).textContent = this.timer/4;
};


StatsBar.prototype.statusUpdate = function (stat){ 
    var money = this.div.querySelector('#money'+this.suffix);
    var health = this.div.querySelector('#health'+this.suffix);
    //var turn = this.div.querySelector('#turn'+this.suffix);
    var income = this.div.querySelector('#income'+this.suffix);
    var storm = this.div.querySelector('#storm'+this.suffix);
    var bean = this.div.querySelector('#bean'+this.suffix);

    money.textContent = stat.money;
    health.textContent = stat.health;
    
    // this.turn--;
    // turn.textContent = this.turn;
    
    income.textContent = stat.income;
    storm.textContent = stat.storm;
    bean.textContent = stat.bean;
};

StatsBar.prototype.setTurn = function(turns){
    this.turn = turns;
    var turn = this.div.querySelector('#turn'+this.suffix);
    turn.textContent = this.turn;
};
