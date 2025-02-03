/**
 * フェーズ:
 *   - 'idle'  (待機/停止中)
 *   - 'work'  (作業中)
 *   - 'break' (休憩中)
 *   - 'alert' (休憩終了後10秒)
 */
let currentPhase = 'idle';
let timeLeft = 0;         // 残り秒数
let initialTime = 0;      // フェーズ開始時点の秒数
let timerInterval = null; // setInterval 用

// ▼ 追加: オーディオ要素を取得しておく
let beepSound = null;
let alarmSound = null;

window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn  = document.getElementById('stopBtn');

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);

  // 音声要素の取得
  beepSound = document.getElementById('beepSound');
  alarmSound = document.getElementById('alarmSound');
});

/** スタート */
function startTimer() {
  const workMinutes  = parseInt(document.getElementById('workTime').value, 10);
  const breakMinutes = parseInt(document.getElementById('breakTime').value, 10);

  if (isNaN(workMinutes) || isNaN(breakMinutes) || workMinutes <= 0 || breakMinutes <= 0) {
    alert('作業時間と休憩時間は正の数値を入力してください。');
    return;
  }

  // ボタン状態
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;

  // フェーズを"work"にして開始
  setPhase('work', workMinutes);

  // カウントダウン開始
  timerInterval = setInterval(updateTimer, 1000);
}

/** ストップ */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentPhase = 'idle';
  timeLeft = 0;
  initialTime = 0;

  // 表示リセット
  document.getElementById('timeDisplay').textContent = '00:00';
  document.getElementById('phaseLabel').textContent = '停止中';

  // 背景色: 待機へ
  setBackgroundClass('idle');
  // 進捗バー色: 待機へ
  setProgressBarClass('idle');

  // ボタン状態
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;

  // 幅を0%
  document.getElementById('progressBar').style.width = '0%';

  // ▼ アラームが鳴っていたら停止
  if (alarmSound) {
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }
}

/** フェーズ設定 */
function setPhase(phase, minutes) {
  currentPhase = phase;

  // alertフェーズは秒数(10秒など)
  if (phase === 'alert') {
    initialTime = minutes;
    timeLeft = minutes;
  } else {
    initialTime = minutes * 60;
    timeLeft = initialTime;
  }

  // ラベル
  const phaseLabel = document.getElementById('phaseLabel');
  switch (phase) {
    case 'work':
      phaseLabel.textContent = '作業中';
      break;
    case 'break':
      phaseLabel.textContent = '休憩中';
      break;
    case 'alert':
      phaseLabel.textContent = '休憩終了!';
      break;
    default:
      phaseLabel.textContent = '待機中';
  }

  // 背景色＆進捗バー色を切り替え
  setBackgroundClass(phase);
  setProgressBarClass(phase);

  // 画面表示
  updateDisplay();
}

/** 1秒ごとにカウントダウン */
function updateTimer() {
  if (timeLeft <= 0) {
    // 次のフェーズへ切り替え
    if (currentPhase === 'work') {
      // 作業終了時 → ビープ音
      if (beepSound) beepSound.play();

      // 作業→休憩
      const breakMins = parseInt(document.getElementById('breakTime').value, 10);
      setPhase('break', breakMins);

    } else if (currentPhase === 'break') {
      // 休憩終了時 → ビープ音
      if (beepSound) beepSound.play();

      // 休憩→アラート (10秒)
      setPhase('alert', 10);

      // アラート音を再生開始（ループ）
      if (alarmSound) {
        alarmSound.currentTime = 0;
        alarmSound.play().catch(err => {
          console.log("Autoplay blocked?", err);
        });
      }

    } else if (currentPhase === 'alert') {
      // アラート終了 → アラーム停止
      if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
      }

      // アラート→作業
      const workMins = parseInt(document.getElementById('workTime').value, 10);
      setPhase('work', workMins);
    }

  } else {
    timeLeft--;
    updateDisplay();
  }
}

/** 画面表示更新 */
function updateDisplay() {
  // mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timeDisplay').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // プログレスバー幅
  let ratio = 1;
  if (initialTime > 0) {
    ratio = timeLeft / initialTime;
  }
  if (ratio < 0) ratio = 0;

  const percent = (ratio * 100).toFixed(2) + '%';
  document.getElementById('progressBar').style.width = percent;
}

/** 背景色クラス切り替え */
function setBackgroundClass(phase) {
  const body = document.body;
  body.classList.remove('idle-bg', 'work-bg', 'break-bg', 'alert-bg');

  switch (phase) {
    case 'work':
      body.classList.add('work-bg');
      break;
    case 'break':
      body.classList.add('break-bg');
      break;
    case 'alert':
      body.classList.add('alert-bg');
      break;
    default:
      body.classList.add('idle-bg');
  }
}

/** 進捗バーの色クラスを切り替え */
function setProgressBarClass(phase) {
  const progressBar = document.getElementById('progressBar');
  progressBar.classList.remove('idle-progress', 'work-progress', 'break-progress', 'alert-progress');

  switch (phase) {
    case 'work':
      progressBar.classList.add('work-progress');
      break;
    case 'break':
      progressBar.classList.add('break-progress');
      break;
    case 'alert':
      progressBar.classList.add('alert-progress');
      break;
    default:
      progressBar.classList.add('idle-progress');
  }
}








