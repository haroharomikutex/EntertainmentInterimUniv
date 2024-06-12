let player1 = {
    health: 3,
    defending: false,
    lastAttackTime: 0,
    lastDefendTime: 0,
    isCharging: false,
    chargeStartTime: 0,
    canCounter: false,
    defenseStartTime: 0,
    holdingDefense: false,
    successfulDefenseTime: 0
};

let player2 = {
    health: 3,
    defending: false,
    lastAttackTime: 0,
    lastDefendTime: 0,
    isCharging: false,
    chargeStartTime: 0,
    canCounter: false,
    defenseStartTime: 0,
    holdingDefense: false,
    successfulDefenseTime: 0
};

function log(message) {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML += `<p>${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function updateHealth() {
    document.getElementById('player1-health').innerText = `体力: ${player1.health}`;
    document.getElementById('player2-health').innerText = `体力: ${player2.health}`;
}

function attack(player) {
    const currentTime = Date.now();
    const attacker = player === 1 ? player1 : player2;
    const defender = player === 1 ? player2 : player1;

    if (currentTime - attacker.lastAttackTime < 1000) {
        log(`プレイヤー ${player} は攻撃しようとしましたが、クールダウン中です。`);
        return;
    }

    let attackDamage = 1;
    if (attacker.isCharging) {
        const chargeDuration = currentTime - attacker.chargeStartTime;
        if (chargeDuration >= 2000) {
            attackDamage = 2;
            log(`プレイヤー ${player} はチャージ攻撃を行いました！`);
        }
        attacker.isCharging = false;
    }

    attacker.lastAttackTime = currentTime;

    if (defender.defending) {
        log(`プレイヤー ${player} は攻撃しましたが、プレイヤー ${player === 1 ? 2 : 1} が防御に成功しました。`);
        defender.canCounter = true;
        defender.successfulDefenseTime = Date.now();
    } else {
        defender.health -= attackDamage;
        log(`プレイヤー ${player} の攻撃が成功し、${attackDamage} ダメージを与えました。プレイヤー ${player === 1 ? 2 : 1} の体力が ${attackDamage} 減りました。`);
    }

    updateHealth();
    checkWin();
}

function defend(player) {
    const currentTime = Date.now();
    const defender = player === 1 ? player1 : player2;

    if (currentTime - defender.lastDefendTime < 1000) {
        log(`プレイヤー ${player} は防御しようとしましたが、クールダウン中です。`);
        return;
    }

    defender.lastDefendTime = currentTime;
    defender.defending = true;
    defender.defenseStartTime = currentTime;
    defender.holdingDefense = true;
    log(`プレイヤー ${player} は防御中です。`);

    setTimeout(() => {
        defender.defending = false;
        defender.holdingDefense = false;
        log(`プレイヤー ${player} は防御をやめました。`);
    }, 3000);
}

function startCharge(player) {
    const attacker = player === 1 ? player1 : player2;
    attacker.isCharging = true;
    attacker.chargeStartTime = Date.now();
    log(`プレイヤー ${player} は攻撃をチャージし始めました。`);
}

function executeCounter(player) {
    const defender = player === 1 ? player1 : player2;
    const attacker = player === 1 ? player2 : player1;

    if (defender.canCounter) {
        attacker.health -= 1;
        log(`プレイヤー ${player} はカウンター攻撃を実行しました！プレイヤー ${player === 1 ? 2 : 1} の体力が 1 減りました。`);
        defender.canCounter = false;
        updateHealth();
        checkWin();
    } else {
        log(`プレイヤー ${player} はカウンター攻撃を試みましたが失敗しました。`);
    }
}

function checkWin() {
    if (player1.health <= 0) {
        log("プレイヤー 2 の勝利です！");
        resetGame();
    } else if (player2.health <= 0) {
        log("プレイヤー 1 の勝利です！");
        resetGame();
    }
}

function resetGame() {
    player1.health = 3;
    player2.health = 3;
    updateHealth();
    log("ゲームをリセットしました。両プレイヤーの体力が 3 に戻りました。");
}

updateHealth();
log("ゲームスタート！両プレイヤーの体力は 3 です。");

// チャージ攻撃のイベントリスナー
document.addEventListener('keydown', (event) => {
    if (event.key === 'a') startCharge(1);
    if (event.key === 'l') startCharge(2);
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a') attack(1);
    if (event.key === 'l') attack(2);
});

// カウンター攻撃のイベントリスナー
document.addEventListener('keydown', (event) => {
    if (event.key === 's') executeCounter(1);
    if (event.key === 'k') executeCounter(2);
});

// 防御のイベントリスナー
document.addEventListener('keydown', (event) => {
    if (event.key === 'b') defend(1);
    if (event.key === 'd') defend(2);
});

function outfieldAttack() {
    const randomPlayer = Math.random() < 0.5 ? player1 : player2;
    randomPlayer.health -= 0.5;
    log(`外部攻撃！${randomPlayer === player1 ? 'プレイヤー 1' : 'プレイヤー 2'} が 0.5 ダメージを受けました。`);
    updateHealth();
    checkWin();
}

function recoveryMechanism() {
    if (player1.holdingDefense && (Date.now() - player1.defenseStartTime >= 5000)) {
        player1.health += 1;
        log(`プレイヤー 1 は 5 秒間防御に成功し、体力が 1 回復しました。`);
    }
    if (player2.holdingDefense && (Date.now() - player2.defenseStartTime >= 5000)) {
        player2.health += 1;
        log(`プレイヤー 2 は 5 秒間防御に成功し、体力が 1 回復しました。`);
    }
    updateHealth();
}

// 10-30秒ごとにランダムな外部攻撃をシミュレート
setInterval(outfieldAttack, Math.random() * (30000 - 10000) + 10000);

// 毎秒回復機能をチェック
setInterval(recoveryMechanism, 1000);

let armor1 = {
    rucksack: false,
    onionExtractShirt: false,
};

let armor2 = {
    rucksack: false,
    onionExtractShirt: false,
};

function applyArmorEffects() {
    if (armor1.rucksack) {
        player1.defending = player1.defending && Math.random() > 0.2;  // 80% の確率でブロック
    }
    if (armor2.rucksack) {
        player2.defending = player2.defending && Math.random() > 0.2;  // 80% の確率でブロック
    }

    if (armor1.onionExtractShirt) {
        player1.health -= 0.2;
        log(`プレイヤー 1 は玉ねぎエキスのシャツによって 0.2 ダメージを受けました。`);
    }
    if (armor2.onionExtractShirt) {
        player2.health -= 0.2;
        log(`プレイヤー 2 は玉ねぎエキスのシャツによって 0.2 ダメージを受けました。`);
    }
    updateHealth();
    checkWin();
}

// 10秒ごとにアーマー効果を適用
setInterval(applyArmorEffects, 10000);

function environmentalEffects() {
    const effect = Math.random();
    if (effect < 0.5) {
        log(`風が吹いています！`);
        if (effect < 0.25) {
            log(`プレイヤー 1 が影響を受け、一時的に防御ができません。`);
            player1.defending = false;
        } else {
            log(`プレイヤー 2 が影響を受け、一時的に防御ができません。`);
            player2.defending = false;
        }
    } else {
        log(`局地的な雨が降っています！`);
        if (effect < 0.75) {
            log(`プレイヤー 1 の攻撃が遅くなります。`);
            player1.lastAttackTime += 500;  // 攻撃が遅くなる
        } else {
            log(`プレイヤー 2 の攻撃が遅くなります。`);
            player2.lastAttackTime += 500;  // 攻撃が遅くなる
        }
    }
}

// 20-40秒ごとに環境効果を発動
setInterval(environmentalEffects, Math.random() * (40000 - 20000) + 20000);
