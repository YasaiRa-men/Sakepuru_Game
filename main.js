const targetelem = document.getElementById("target");
const targetField = document.getElementById("targetField");
const mainelem = document.getElementById("mainWindow");
const gameTitle = document.getElementById("gameTitle");
const startButton = document.getElementById("startButton");
const gameoverTitle = document.getElementById("gameoverTitle");
const endButton = document.getElementById("endButton");

//ブラウザの横幅、縦幅を取得（サイズ可変にも対応させるため定数ではない）
let ScreenWidth = window.innerWidth;
let ScreenHeight = window.innerHeight;

//スクリーンをずらした誤差の調整
let Offset_X = ScreenWidth / 2 - mainelem.offsetWidth / 2;

//スクリーンの大きさより移動可能幅の方が大きい場合、移動可能幅をスクリーンの大きさに合わせる
mainelem.style.width = Math.min(ScreenWidth, mainelem.offsetWidth) + "px";

// ウィンドウサイズが変更されたときにScreenWidthとScreenHeightを更新
window.addEventListener("resize", function () {
    ScreenWidth = window.innerWidth;
    ScreenHeight = window.innerHeight;

    //スクリーンをずらした誤差の調整
    Offset_X = ScreenWidth / 2 - mainelem.offsetWidth / 2;
});

let Score = 0;

// target と障害物を非表示にする
targetelem.style.display = "none";
gameoverTitle.style.display = "none";

let water_Interval;
let water_Animation;
let water_ms;

// スタートボタンのクリックイベント
startButton.addEventListener("click", function () {
    // ゲームタイトルとスタートボタンを非表示にする
    gameTitle.style.display = "none";
    mainelem.style.display = "block";

    // target を表示する
    targetelem.style.display = "block";
    anime({
        targets: "#target",
        translateX: targetField.offsetWidth / 2 - targetelem.clientWidth / 2,
        translateY: targetField.offsetTop + targetField.offsetHeight / 2 - targetelem.clientHeight / 2,
        duration: 0,
        easing: "linear",
    });

    // 障害物生成を開始する

    water_ms = 1500;
    water_Interval = setTimeout(water, water_ms);

    // イベントリスナーを有効にする
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("touchmove", touchMoveHandler, { passive: false });
});

// ホームボタンのクリックイベント
endButton.addEventListener("click", function () {
    // ゲームタイトルにする
    gameTitle.style.display = "block";
    gameoverTitle.style.display = "none";

    // ゲームを初期化する
    InitGame();
    Score = 0;

    // イベントリスナーを無効にする
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("touchmove", touchMoveHandler, { passive: false });
});

//パソコンでの操作
function mouseMoveHandler(e) {
    let Mouse_X = Math.max(0, e.clientX - targetelem.clientWidth / 2 - Offset_X);
    Mouse_X = Math.min(mainelem.offsetWidth - targetelem.clientWidth, Mouse_X);

    let Mouse_Y = Math.max(targetField.offsetTop, e.clientY - targetelem.clientHeight / 2);
    Mouse_Y = Math.min(mainelem.clientHeight - targetField.clientHeight - targetelem.clientWidth, Mouse_Y);

    anime({
        targets: "#target",
        translateX: Mouse_X,
        translateY: Mouse_Y,
        duration: 400,
        easing: "easeOutCubic",
    });
}

//スマホでの操作
function touchMoveHandler(e) {
    let Touch_X = Math.max(0, e.touches[0].clientX - targetelem.clientWidth / 2 - Offset_X);
    Touch_X = Math.min(mainelem.offsetWidth - targetelem.clientWidth, Touch_X);

    let Touch_Y = Math.max(targetField.offsetTop, e.touches[0].clientY - targetelem.clientHeight / 2);
    Touch_Y = Math.min(mainelem.clientHeight - targetField.clientHeight - targetelem.clientWidth, Touch_Y);

    anime({
        targets: "#target",
        translateX: Touch_X,
        translateY: Touch_Y,
        duration: 400,
        easing: "easeOutCubic",
    });
}

function disableScroll(event) {
    event.preventDefault();
}

// タッチ操作の場合は長押しによるイベントを呼び出さないようにする
document.addEventListener("touchmove", disableScroll, { passive: false });

// 当たり判定を検知
setInterval(function () {
    GameEvent();
    if (targetelem.style.display == "block") {
        Score++;
        document.querySelector("#Score").innerHTML = Score;
    }
}, 10);

//時間処理
function GameEvent() {
    const waters = document.querySelectorAll(".water");

    for (let water of waters) {
        let water_X = Math.abs(
            new WebKitCSSMatrix(water.style.transform).m41 - new WebKitCSSMatrix(targetelem.style.transform).m41
        );
        let water_Y = Math.abs(
            new WebKitCSSMatrix(water.style.transform).m42 - new WebKitCSSMatrix(targetelem.style.transform).m42
        );

        distance = Math.sqrt(water_X ** 2 + water_Y ** 2);

        let waterSize = water.offsetWidth;

        if (distance < targetelem.offsetWidth / 2 + waterSize / 2) {
            targetelem.style.display = "none";
            gameoverTitle.style.display = "block";

            clearTimeout(water_Interval); // タイマーをキャンセル

            for (let i = 0; i < waternum; i++) {
                if (document.querySelector("#s" + i) != null) {
                    anime.remove("#s" + i);
                    document.querySelector("#s" + i).remove();
                }
            }
            waternum = 0;
        }
    }
}

function InitGame() {}

//障害物(小),
let waternum = 0;
function water() {
    mainelem.insertAdjacentHTML("afterbegin", '<img id="s' + waternum + '" class="water" src="src/water.png">');

    let ranX = (mainelem.offsetWidth - document.getElementById("s" + waternum).offsetWidth) * Math.random();
    let snum = waternum;

    water_Animation = anime({
        targets: "#s" + waternum,
        translateX: [ranX, ranX],
        translateY: [-100, ScreenHeight + 100],
        duration: 4000,
        easing: "easeInCubic",
        complete: function () {
            document.querySelector("#s" + snum).remove();
        },
    });

    //console.log(waternum);

    waternum++;

    water_ms -= 50;
    water_ms = Math.max(water_ms, 200);

    water_Interval = setTimeout(water, water_ms);
}
