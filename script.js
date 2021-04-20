// スタート
start_pos = [];
// ゴール
goal_pos = [];
//迷路サイズ
num = null;
// 深さ優先探索で使うスタック
prev_pos_list = [];
// 幅優先探索で使うキュー
que = [];
// インターバルで実行する関数を開放するための
timer = null;
// 迷路が作成済みかどうか
flg = false;
// A*で使うノードの配列
nodes = []
// A*で使うオープンリスト
open_list = [];

start_flg = false;
goal_flg = false;

// A*アルゴリズムで使うクラス
class Node {
    constructor(y, x) {
        this.y = y;
        this.x = x;
        // オープンかクローズかnullか
        this.type = -1; // -1 none 0 close 1 open
        // 実コスト
        this.cost = null;
        // 推定コスト
        this.hue_cost = this.cal_hue_cost(x, y);
        // 親ノード
        this.parent = null;
        // 壁か
        this.is_wall = this.set_is_wall();
    }

    // コストの計算
    cal_hue_cost(x, y) {
        return Math.abs(y - goal_pos[0]) + Math.abs(x - goal_pos[1]);
        //return Math.sqrt( (y - goal_pos[0]) * (y - goal_pos[0]) + (x - goal_pos[1]) * (x - goal_pos[1]) )
    }

    // オープン処理
    open() {
        // オープンに
        this.type = 1;
        // クラス追加
        $(`#${this.y}-${this.x}`).addClass('now');
        return;
    }

    // クローズ処理
    close() {
        // クローズに
        this.type = 0;
        // クラス削除と追加
        $(`#${this.y}-${this.x}`).removeClass('now');
        $(`#${this.y}-${this.x}`).addClass('prev');
        return;
    }

    // 壁かどうかの判定
    set_is_wall() {
        var cls_ar = $(`#${this.y}-${this.x}`).attr('class').split(' ');
        if (cls_ar.includes('wall')) {
            return true;
        } else {
            return false;
        }
    }

}

// 迷路の初期化
function init() {
    $('.now').removeClass('now');
    $('.prev').removeClass('prev');
    $('.prev-now').removeClass('prev-now');
}

$(function () {
    //サイズ選択フォームを作成
    for (var i = 5; i <= 102; i += 2) {
        $('#num').append(`<option value="${i}">${i}</option>`)
    }


    $('#create-btn').click(function () {
        clearInterval(timer);
        create_meiro();
        start_flg = false;
        goal_flg = false;
        flg = true;

    })

    $('#start-btn').click(function () {
        if (!flg) {
            return;
        }
        if (start_flg) {
            start_flg = false;
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-outline-primary');
            return;
        }
        init();
        start_flg = true;
        goal_flg = false;
        $(this).removeClass('btn-outline-primary');
        $(this).addClass('btn-primary');
        $('#goal-btn').removeClass('btn-primary');
        $('#goal-btn').addClass('btn-outline-primary');
    })

    $('#goal-btn').click(function () {
        if (!flg) {
            return;
        }
        if (goal_flg) {
            goal_flg = false;
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-outline-primary');
            return;
        }
        init();
        start_flg = false;
        goal_flg = true;
        $(this).removeClass('btn-outline-primary');
        $(this).addClass('btn-primary');
        $('#start-btn').removeClass('btn-primary');
        $('#start-btn').addClass('btn-outline-primary');
    })


    $('#depth-first-btn').click(function () {
        if (!flg) {
            return;
        }
        if (start_pos.length != 2 || goal_pos.length != 2) {
            return;
        }

        init();
        $(`#${start_pos[0]}-${start_pos[1]}`).addClass('now');
        prev_pos_list = [];
        clearInterval(timer);
        timer = setInterval(depth_first, 1);
    })

    $('#breadth-first-btn').click(function () {
        if (!flg) {
            return;
        }
        if (start_pos.length != 2 || goal_pos.length != 2) {
            return;
        }
        init();
        que = [];
        $(`#${start_pos[0]}-${start_pos[1]}`).attr('data-step', 0);
        que.push([start_pos[0], start_pos[1], 0]);
        clearInterval(timer);
        timer = setInterval(breadth_first, 1);
    })

    $('#a-star-btn').click(function () {
        if (!flg) {
            return;
        }
        if (start_pos.length != 2 || goal_pos.length != 2) {
            return;
        }
        init();

        nodes = [];
        open_list = [];
        //ノードを作成
        for (var i = 0; i < num; i++) {
            nodes[i] = []
            for (var j = 0; j < num; j++) {
                node = new Node(i, j)
                nodes[i].push(node);
            }
        }

        // スタート地点のノードをオープンにする
        node = nodes[start_pos[0]][start_pos[1]];
        node.cost = 0;
        node.open();
        open_list.push(node);

        clearInterval(timer);
        timer = setInterval(a_star, 1);
    })

})

function create_meiro() {
    start_pos = [];
    goal_pos = [];
    $('.meiro').empty();
    num = $('#num').val();

    // 迷路
    for (var i = 0; i < num; i++) {
        for (var j = 0; j < num; j++) {
            var format = `<div id="${i}-${j}" class="meiro-cell"></div>`
            $('.meiro').append(format)
        }
    }

    $('.meiro-cell').css('width', 100 / num + '%');
    $('.meiro-cell').css('height', 100 / num + '%');

    method = $('#method').val();
    if (method == 0) {
        boutaosi_method();
    } else if (method == 1) {
        kabenobashi_method();
    }

    $('.meiro-cell').mouseover(function () {
        pos = $(this).attr('id').split('-');
        cls_ar = $(this).attr('class').split(' ')
        if (!cls_ar.includes('wall')) {

            if (start_flg) {
                $(this).addClass('start-selected');
            }

            if (goal_flg) {
                $(this).addClass('goal-selected');
            }
        }

    }).mouseout(function () {
        $(this).removeClass('start-selected');
        $(this).removeClass('goal-selected');
    })

    $('.meiro-cell').click(function () {
        cls_ar = $(this).attr('class').split(' ')
        if (!cls_ar.includes('wall')) {
            if (start_flg) {
                $(`#${start_pos[0]}-${start_pos[1]}`).removeClass('start');
                start_pos = [parseInt(pos[0]), parseInt(pos[1])];
                $(this).addClass('start');
                start_flg = false;
                $('#start-btn').removeClass('btn-primary');
                $('#start-btn').addClass('btn-outline-primary');
            }

            if (goal_flg) {
                $(`#${goal_pos[0]}-${goal_pos[1]}`).removeClass('goal');
                goal_pos = [parseInt(pos[0]), parseInt(pos[1])];
                $(this).addClass('goal');
                goal_flg = false;
                $('#goal-btn').removeClass('btn-primary');
                $('#goal-btn').addClass('btn-outline-primary');
            }
        }
    })
}


function boutaosi_method() {
    //全マスについて繰り返す
    for (var y = 0; y < num; y++) {
        for (var x = 0; x < num; x++) {
            //上壁
            if (y == 0) {
                $(`#${y}-${x}`).addClass('wall');
                continue;
            }
            //右
            if (x == num - 1) {
                $(`#${y}-${x}`).addClass('wall');
                continue;
            }
            //下
            if (y == num - 1) {
                $(`#${y}-${x}`).addClass('wall');
                continue;
            }
            //右
            if (x == 0) {
                $(`#${y}-${x}`).addClass('wall');
                continue;
            }

            // 棒と倒すところ
            if (x % 2 == 0 && y % 2 == 0) {
                while (true) {
                    // 2行目なら上にも倒せる
                    if (y == 2) {
                        dir = Math.floor(Math.random() * 4);
                    } else {
                        dir = Math.floor(Math.random() * 3);
                    }

                    //上
                    if (dir == 3) {
                        target = `#${y - 1}-${x}`;
                    }

                    //右
                    if (dir == 2) {
                        target = `#${y}-${x + 1}`;
                    }

                    //下
                    if (dir == 1) {
                        target = `#${y + 1}-${x}`;
                    }

                    //左
                    if (dir == 0) {
                        target = `#${y}-${x - 1}`;
                    }

                    //すでに壁じゃないかチェック
                    if ($(target).attr('class') == 'wall') {
                        continue;
                    }

                    //壁じゃなかったら
                    $(`#${y}-${x}`).addClass('wall');
                    $(target).addClass('wall');
                    break;

                }
            }
        }
    }
}


function kabenobashi_method() {
    var wall_kouho = [];
    //外周をすべて壁にする
    for (var y = 0; y < num; y++) {
        for (var x = 0; x < num; x++) {
            //上
            if (y == 0) {
                $(`#${0}-${x}`).addClass('wall');
                continue;
            }
            //右
            if (x == num - 1) {
                $(`#${y}-${num - 1}`).addClass('wall');
                continue;
            }
            //下
            if (y == num - 1) {
                $(`#${num - 1}-${x}`).addClass('wall');
                continue;
            }
            //左
            if (x == 0) {
                $(`#${y}-${0}`).addClass('wall');
                continue;
            }

            if (y % 2 == 0 && x % 2 == 0) {
                wall_kouho.push([y, x]);
            }
        }
    }

}

function depth_first() {
    // 今の座標
    now_pos = $('.now').attr('id').split('-');
    // とれなかったら開放
    if (!now_pos) {
        clearInterval(timer);
        return;
    }

    y = parseInt(now_pos[0]);
    x = parseInt(now_pos[1]);
    // ゴールについたら開放
    if (y == goal_pos[0] && x == goal_pos[1]) {
        clearInterval(timer);
        return;
    }

    if (y == start_pos[0] && x == start_pos[1]) {
        if ($(`#${y - 1}-${x}`).attr('class').split(' ').includes('wall')) {
            prev = [y - 1, x];
        } else if ($(`#${y}-${x + 1}`).attr('class').split(' ').includes('wall')) {
            prev = [y, x + 1];
        } else if ($(`#${y + 1}-${x}`).attr('class').split(' ').includes('wall')) {
            prev = [y + 1, x];
        } else if ($(`#${y}-${x - 1}`).attr('class').split(' ').includes('wall')) {
            prev = [y, x - 1];
        } else {
            prev = [y - 1, x];
        }
    } else {
        // ひとつ前の座標
        prev = prev_pos_list[prev_pos_list.length - 1];
    }
    p_y = prev[0];
    p_x = prev[1];
    // ひとつ前からのベクトル
    v = [y - p_y, x - p_x];

    // 進行方向に対して右かまっすぐか左か
    var right = `#${y + v[1]}-${x - v[0]}`;
    var straight = `#${y + v[0]}-${x + v[1]}`;
    var left = `#${y - v[1]}-${x + v[0]}`;

    dirction = [right, straight, left];
    //進行方向を決める
    for (var idx = 0; idx < 3; idx++) {
        val = dirction[idx];
        cls_ar = $(val).attr('class').split(' ');
        if (cls_ar.includes('wall') || cls_ar.includes('prev-now') || cls_ar.includes('prev')) {
            continue;
        } else {
            // 進める
            $(val).addClass('now');
            $(`#${y}-${x}`).removeClass('now');
            $(`#${y}-${x}`).addClass('prev-now');
            prev_pos_list.push([y, x]);
            return;
        }
    };

    // 該当がなかったら一個戻す
    $(`#${y}-${x}`).removeClass('now');
    $(`#${y}-${x}`).addClass('prev');
    prev = prev_pos_list[prev_pos_list.length - 1];
    prev_pos_list.pop();
    $(`#${prev[0]}-${prev[1]}`).addClass('now');
    $(`#${prev[0]}-${prev[1]}`).removeClass('prev-now');
    return;
}

function breadth_first() {
    // キューから取り出す
    y = que[0][0];
    x = que[0][1];
    step = que[0][2];
    // ゴールについたら開放
    if (y == goal_pos[0] && x == goal_pos[1]) {
        // 最短距離を可視化する
        $(`#${y}-${x}`).addClass('prev-now');

        while (step != 0) {
            step = parseInt($(`#${y}-${x}`).attr('data-step'));
            if (step == 0) {
                break;
            }
            var up = [y - 1, x];
            var right = [y, x + 1];
            var down = [y + 1, x];
            var left = [y, x - 1];
            direction = [up, right, down, left];
            for (var idx = 0; idx < 4; idx++) {
                target_y = direction[idx][0];
                target_x = direction[idx][1];
                cls_ar = $(`#${target_y}-${target_x}`).attr('class').split(' ');
                if (cls_ar.includes('wall') || !cls_ar.includes('prev')) {
                    continue;
                }
                target_step = parseInt($(`#${target_y}-${target_x}`).attr('data-step'));
                if (step - 1 == target_step) {
                    $(`#${target_y}-${target_x}`).removeClass('prev');
                    $(`#${target_y}-${target_x}`).addClass('prev-now');
                    y = target_y;
                    x = target_x;
                    break;
                }

            }
        }
        clearInterval(timer);
        return;
    }

    $(`#${y}-${x}`).addClass('prev');
    que.shift();
    //取り出した周りを探す
    var up = [y - 1, x];
    var right = [y, x + 1];
    var down = [y + 1, x];
    var left = [y, x - 1];
    direction = [up, right, down, left];
    for (var idx = 0; idx < direction.length; idx++) {
        move_y = direction[idx][0];
        move_x = direction[idx][1];
        cls_ar = $(`#${move_y}-${move_x}`).attr('class').split(' ');
        if (cls_ar.includes('wall') || cls_ar.includes('prev-now') || cls_ar.includes('prev')) {
            continue;
        } else {
            //すてにキューに入っていたら追加しない
            var some = que.some(
                q => q[0] == move_y && q[1] == move_x
            );
            if (some) {
                continue;
            }

            // キューに追加

            $(`#${move_y}-${move_x}`).attr('data-step', step + 1);
            que.push([move_y, move_x, step + 1]);
        }
    }
}

function get_min_node() {
    // オープンリストの中から最小のコストを持つノードを返す
    min_score = null;
    min_node = null;
    for (var i = 0; i < open_list.length; i++) {
        score = open_list[i].cost + open_list[i].hue_cost;
        if (i == 0) {
            min_score = score;
            min_idx = i;
            continue;
        }
        if (score < min_score) {
            min_score = score;
            min_idx = i;
        }
    }

    node = open_list[min_idx];
    open_list.splice(min_idx, 1);

    return node;
}

function a_star() {
    // 最小コストのノードを取得
    node = get_min_node();
    y = node.y;
    x = node.x;
    // ゴールなら可視化処理
    if (y == goal_pos[0] && x == goal_pos[1]) {
        // ゴールにクラス追加
        $('.now').removeClass('now');
        node.open();
        parent = node.parent;
        // 親ノードをたどってクラス追加
        while (parent != null) {
            $(`#${parent.y}-${parent.x}`).removeClass('prev');
            $(`#${parent.y}-${parent.x}`).addClass('now');
            parent = parent.parent;
        }

        clearInterval(timer);
        return;
    }
    // 実コスト
    cost = node.cost;
    // クローズ
    node.close();
    //コストを増やす
    cost++;

    //オープンしていく
    var up = [y - 1, x];
    var right = [y, x + 1];
    var down = [y + 1, x];
    var left = [y, x - 1];
    var directions = [up, right, down, left];

    for (var idx = 0; idx < 4; idx++) {
        // 上下左右のノード
        dir = directions[idx];
        target = nodes[dir[0]][dir[1]];
        // 壁なら処理しない
        if (target.is_wall) { continue }
        // コストがヌルじゃなければ低いコストで更新する
        if (target.cost != null) {
            if (target.cost > cost) {
                target.cost = cost;
                target.parent = node;
            }
        }

        // オープンかクローズだったら処理しない
        if (target.type != -1) { continue }

        // コストと親を登録してオープン
        target.cost = cost
        target.open();
        target.parent = node;

        if (!open_list.includes(target)) {
            open_list.push(target);
        }
    }
}