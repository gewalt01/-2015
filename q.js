/**
 * Q学習
 * 行動: 4方向移動
 * 環境: 座標
 * 報酬: ゴールに移動(100), 移動(-1), 壁に衝突(-100)
 * 学習率: 
 * 割引率: 
 *
 * episode: 周回
 * step: ステップ数
 */

/*
 * 
 * @param {type} action_num
 * @param {type} col
 * @param {type} row
 * @param {type} map
 * @returns {QLearning}
 */
function QLearning(action_num, col, row, map) {
    this.actionNum = action_num;
    this.col = col;
    this.row = row;
    this.map = map;

    this.init();
};


/*
 * 初期化
 */
QLearning.prototype.init = function() {
    this.episode = 0;
    this.step = 0;
    this.state = new State(1, 1);
    this.agent = new Agent();
    this.rewards = [-1, 100000, -1, -1000, -10];//移動, ゴール, 壁, 毒沼
    this.damage = [0, 0, 1, 0, 10];
    this.learningRate = 0.6;
    this.discountRate = 0.9;
    this.randomRate = 0.1;
    this.q = function(x, y, z) {
        var map = new Array(y);
        for (i = 0; i < y; i++)
        {
            map[i] = new Array(x);
            for (j = 0; j < x; j++)

            {
                map[i][j] = new Array(z);
                for (var k = 0; k < z; k++)
                {
                    map[i][j][k] = 0;
                }
                //map[i][j][2] = 100;
            }
        }
        return map;
    }(this.row, this.col, this.actionNum);
    this.lastAction = 0;
    this.HP = this.maxHP = 500;
};

/*
 * 戦略番号取得
 * Qの最大方向
 */
QLearning.prototype.getActionNumber = function(x, y) {
    var max_n = 0;
    for (var i = 1; i < this.actionNum; i++)
    {
        max_n = this.q[y][x][i] < this.q[y][x][max_n] ? max_n : i;
    }

    return max_n;
};

/*
 * 最大のQ値取得
 */
QLearning.prototype.getMaxQ = function(x, y) {

    var max_q = this.q[y][x][0];
    for (var i = 1; i < this.actionNum; i++)
    {
        max_q = Math.max(max_q, this.q[y][x][i]);
    }
    return max_q;
};

/*
 * 移動可能かどうか
 */
QLearning.prototype.isAvailable = function(map, x, y) {
    if (x < 0 || this.row <= x || y < 0 || this.col <= y)
        return false;
    if (map[y][x] === 3)
        return false;

    return true;
};

/*
 * ゴールかどうか
 */
QLearning.prototype.isGoal = function(map, x, y) {
    if (x < 0 || this.row <= x || y < 0 || this.col <= y)
        return false;
    if (map[y][x] === 1)
        return true;

    return false;
};


/*
 * Q値更新
 */
QLearning.prototype.updateQ = function(map, oldx, oldy, action_number, nextx, nexty) {
    this.q[oldy][oldx][action_number] += this.learningRate * (this.getReword(map, nextx, nexty) + this.discountRate * this.getMaxQ(nextx, nexty) - this.q[oldy][oldx][action_number]);
    //console.log("reword", this.getReword(map, nextx, nexty));
};

/*
 * 報酬取得
 */
QLearning.prototype.getReword = function(map, x, y) {
    return (x < 0 || this.row <= x || y < 0 || this.col <= y) ? -999999 : this.rewards[map[y][x]];
};

/*
 * 行動
 */
QLearning.prototype.action = function(map) {
    this.onStepStart();

    //移動方向定義
    var dx = [0, 1, 0, -1];
    var dy = [-1, 0, 1, 0];

    //移動方向選択
    var act_n = this.getActionNumber(this.state.x, this.state.y);
    act_n = (Math.random() < this.randomRate) ? Math.floor(Math.random() * 4) : act_n;
    this.lastAction = act_n;
    
    var nx = this.state.x + dx[act_n];
    var ny = this.state.y + dy[act_n];
    //console.log(nx, ny, this.isAvailable(map, nx, ny), act_n)

    //Q値更新
    this.updateQ(map, this.state.x, this.state.y, act_n, nx, ny);

    //移動できたら移動
    if (this.isAvailable(map, nx, ny)) {
        this.state.x = nx;
        this.state.y = ny;
    
        //ダメージ計算
        this.HP -= this.damage[map[this.state.y][this.state.x]];
        //死んだら最初から
        if (this.HP <= 0) this.onEpisodeEnd();

        if (this.isGoal(map, nx, ny)) {
            this.onEpisodeEnd();
        }
        //console.log("move to", nx, ny)
    }
    
    this.onStepEnd();

    //再描画
    //this.dr.drawMap(this.map);
    //this.dr.drawChar(this.state.x, this.state.y);

};

/*
 * ステップ開始時
 */
QLearning.prototype.onStepStart = function() {
    this.step++;
    //
};


/*
 * ステップ終了時
 */
QLearning.prototype.onStepEnd = function() {
    document.getElementById("step").innerText = this.step;
    document.getElementById("hp").innerText = this.HP;
};

/*
 * エピソード終了時
 */
QLearning.prototype.onEpisodeEnd = function() {
    this.state.x = 1;
    this.state.y = 1;
    this.episode++;
    this.step = 0;
    var lastHP = this.HP;
    this.HP = this.maxHP;

    document.getElementById("episode").innerText = this.episode;
    document.getElementById("lasthp").innerText = lastHP;
};

//メインルーチン
QLearning.prototype.changeInterval = function(time) {
    clearInterval(this.timerId);
    this.timerId = setInterval(function(obj) {
        //obj.dr.drawBox(obj.map, obj.state.x, obj.state.y);
//		obj.action(obj.map);
//		obj.dr.drawChar(obj.state.x, obj.state.y);
    }, time, this);
};


/*
 * エージェント
 * 行動選択: ルーレット
 * 行動:上下左右
 */
var Agent = function() {

};

/*
 * 環境:座標x,y
 */
var State = function(x, y) {
    this.x = x;
    this.y = y;
};

/* Map
 * 0: スタート地点(報酬-1)
 * 1: ゴール地点(報酬100)
 * 2: 道(報酬-1)
 * 3: 壁(移動不可, 報酬-100)
 * 4: 毒沼(報酬-10) 
 */
var map = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 3, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 3, 2, 2, 2, 2, 3, 2, 4, 2, 4, 2, 4, 2, 4, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 3, 2, 3],
    [3, 2, 3, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 2, 3, 3, 3, 3, 2, 3, 3, 2, 3, 2, 2, 3],
    [3, 2, 3, 2, 3, 2, 2, 2, 2, 3, 2, 4, 2, 4, 2, 4, 2, 4, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2, 3, 2, 3, 3],
    [3, 2, 3, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 3, 2, 3, 2, 3, 2, 2, 3, 2, 3, 3],
    [3, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 4, 2, 4, 2, 4, 2, 4, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2, 3, 2, 3, 3],
    [3, 2, 4, 4, 2, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 4, 4, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 3, 2, 2, 3],
    [3, 2, 4, 4, 2, 3, 2, 2, 2, 4, 2, 4, 2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2, 3, 3, 3, 3],
    [3, 2, 4, 4, 2, 3, 2, 2, 4, 2, 2, 2, 4, 2, 2, 3, 4, 4, 3, 3, 3, 2, 3, 3, 2, 2, 3, 2, 2, 2, 2, 3],
    [3, 2, 4, 4, 2, 3, 2, 4, 2, 4, 2, 2, 2, 4, 2, 3, 4, 4, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2, 3, 3, 2, 3],
    [3, 2, 2, 2, 2, 3, 4, 2, 4, 2, 2, 2, 2, 2, 4, 3, 4, 4, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 3, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3],
    [3, 2, 2, 2, 2, 3, 4, 2, 4, 2, 2, 4, 2, 2, 4, 3, 4, 4, 3, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 4, 4, 2, 3, 2, 4, 2, 4, 2, 4, 2, 4, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3],
    [3, 4, 2, 2, 4, 3, 2, 2, 4, 2, 2, 2, 4, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3],
    [3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 3],
    [3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 3, 3, 3, 3, 2, 3, 2, 2, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 3],
    [3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 3, 2, 2, 2, 2, 2, 3, 2, 3, 2, 2, 3],
    [3, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 2, 2, 3, 2, 3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 3, 2, 3, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 3, 2, 2, 2, 3, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 2, 2, 3, 2, 2, 3, 2, 2, 2, 2, 3, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 2, 2, 3],
    [3, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
];



function Draw(canvas_id, col, row) {
    this.cv = document.getElementById(canvas_id);
    this.ctx = this.cv.getContext('2d');
    this.col = col;
    this.row = row;
    this.boxW = this.cv.width / this.row;
    this.boxH = this.cv.height / this.col;

    this.img = new Array(5);
    this.ptn = Array(5);
    this.img[2] = new Image();
    this.img[2].src = "./image/2.png";
    this.ptn[2] = this.ctx.createPattern(this.img[2], "");
    this.img[4] = new Image();
    this.img[4].src = "./image/4.png";
    this.ptn[4] = this.ctx.createPattern(this.img[4], "");

    this.ftype = [];
    this.ftype[0] = function(obj) {
        obj.ctx.fillStyle = "#FF0000";
    };
    this.ftype[1] = function(obj) {
        obj.ctx.fillStyle = "#0000FF";
    };
    this.ftype[2] = function(obj) {
        obj.ctx.fillStyle = obj.ptn[2];
    };
    this.ftype[3] = function(obj) {
        obj.ctx.fillStyle = "#000000";
    };
    this.ftype[4] = function(obj) {
        obj.ctx.fillStyle = obj.ptn[4];
    };

    this.charImage = Array(4);
    for (var i = 0; i < 4; i++)
    {
        this.charImage[i] = Array(3);
        for (var j = 0; j < 3; j++)
        {
            var tmp_img = new Image();
            tmp_img.src = "./image/char_" + (3 * i + j) + ".png";
            this.charImage[i][j] = tmp_img;
        }
    }


    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = "#000000";
    this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);

}

Draw.prototype.drawMap = function(map) {
    for (var col_count = 0; col_count < this.col; col_count++)
    {
        for (var row_count = 0; row_count < this.row; row_count++)
        {
            this.drawBox(map, row_count, col_count);
        }
    }
};

Draw.prototype.drawBox = function(map, x, y) {
    if (map[y][x] in this.ftype)
        this.ftype[map[y][x]](this);


    this.ctx.fillRect(x * (this.boxW), y * (this.boxH), this.boxW, this.boxH);
    this.ctx.strokeRect(x * (this.boxW), y * (this.boxH), this.boxW, this.boxH);
};

Draw.prototype.drawChar = function(x, y, ptn, count) {
    /*
     this.ctx.beginPath();
     this.ctx.arc((x+0.5)*(this.boxW), (y+0.5)*(this.boxH), this.boxW/2, 0, Math.PI*2, false);
     this.ctx.fillStyle="#777777";
     this.ctx.fill();
     this.ctx.closePath();
     */
    this.ctx.drawImage(this.charImage[ptn][1], x*this.boxW, y*this.boxH, this.boxW, this.boxH);
};

Draw.prototype.redraw = function() {
    this.drawMap();
    this.drawBox();
    this.drawChar();
};


/*
 * コントローラ
 */
function ctrl() {
    this.map = map;
    this.ql = new QLearning(4, 32, 32, this.map);
    this.dr = new Draw("screen", 32, 32);
    this.timerId = 0;
    this.frameRate = 60;
    this.quickMode = false;
    this.charCount = 0;

    this.dr.drawMap(this.map);
    this.dr.drawChar(1, 1, 0, this.charCount);
}

ctrl.prototype.start = function() {
    this.timerId = setInterval(function(obj) {

        if (obj.quickMode) {
            for (var i = 0; i < 50000; i++)
            {
                obj.ql.action(obj.map);
            }
        } else {
            obj.dr.drawBox(obj.map, obj.ql.state.x, obj.ql.state.y);
            obj.ql.action(obj.map);
            obj.dr.drawChar(obj.ql.state.x, obj.ql.state.y, obj.ql.lastAction, this.charCount);
            obj.changeBG(obj.ql.state.x, obj.ql.state.y, obj.map);
            obj.charCount = (this.charCount + 1) % 3;
            document.getElementById("life_green").style.width = 100 * obj.ql.HP / obj.ql.maxHP + "%";
            document.getElementById("life_red").style.width = 100 * (1-obj.ql.HP / obj.ql.maxHP) + "%";

        }

    }, 1000 / this.frameRate, this);


};

ctrl.prototype.changeFrameRate = function(fps) {
    clearInterval(this.timerId);
    this.frameRate = fps;
    this.start();
};

ctrl.prototype.changeQuickMode = function(bool) {
    if (bool) {
        //this.dr.redraw();
        //this.dr.drawMap(this.map);
        this.dr.drawBox(this.map, this.ql.state.x, this.ql.state.y);
        //this.dr.drawChar(this.ql.state.x, this.ql.state.y);
    }

    this.quickMode = bool;
};

ctrl.prototype.changeBG = function(x, y, map){
    document.body.style.backgroundColor = "white";
    if(this.frameRate > 10) return; //点滅注意
    if(map[y][x] === 4) {
        document.body.style.backgroundColor = "darkred";
    }
};