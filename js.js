 
// 游戏状态变量
let score = 0;
let timeLeft = 60;
let gameActive = false;
let timerInterval = null;
let selectedEnglish = null;
let selectedChinese = null;
let wordPairs = [];
let remainingPairs = 0;

// DOM元素缓存
const DOM = {
    englishWords: document.getElementById('english-words'),
    chineseWords: document.getElementById('chinese-words'),
    gameOver: document.getElementById('game-over'),
    matchAnimation: document.getElementById('match-animation'),
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    remaining: document.getElementById('remaining'),
    finalScore: document.getElementById('final-score'),
    finalTime: document.getElementById('final-time'),
    gameResult: document.getElementById('game-result'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    importBtn: document.getElementById('import-btn'),
    exportBtn: document.getElementById('export-btn'),
    fileInput: document.getElementById('file-input'),
    playAgainBtn: document.getElementById('play-again-btn')
};

// 默认单词数据
const defaultWordPairs = [
    { english: "apple", chinese: "苹果" },
    { english: "banana", chinese: "香蕉" },
    { english: "cat", chinese: "猫" },
    { english: "dog", chinese: "狗" },
    { english: "hello", chinese: "你好" },
    { english: "world", chinese: "世界" },
    { english: "book", chinese: "书" },
    { english: "pen", chinese: "笔" },
    { english: "computer", chinese: "电脑" },
    { english: "school", chinese: "学校" }
];

// 初始化游戏
function initGame() {
    score = 0;
    timeLeft = 60;
    gameActive = false;
    selectedEnglish = null;
    selectedChinese = null;

    // 更新UI
    updateScore();
    updateTimer();

    // 清空单词容器
    DOM.englishWords.innerHTML = '';
    DOM.chineseWords.innerHTML = '';

    // 重置游戏结束界面
    DOM.gameOver.classList.remove('active');

    // 停止计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 加载单词数据
function loadWordPairs(pairs) {
    wordPairs = [...pairs];
    remainingPairs = wordPairs.length;
    updateRemaining();

    // 创建英文和中文单词数组(打乱顺序)
    const englishWords = wordPairs.map(pair => pair.english);
    const chineseWords = wordPairs.map(pair => pair.chinese);

    // 打乱数组
    shuffleArray(englishWords);
    shuffleArray(chineseWords);

    // 生成英文单词卡片
    generateWordCards(englishWords, 'english', DOM.englishWords);

    // 生成中文单词卡片
    generateWordCards(chineseWords, 'chinese', DOM.chineseWords);
}

// 生成单词卡片
function generateWordCards(words, type, container) {
    words.forEach(word => {
        const card = document.createElement('div');
        card.className = `word-card ${type}-word`;
        card.dataset.word = word;
        card.textContent = word;
        card.addEventListener('click', () => selectWord(word, card, type));
        container.appendChild(card);
    });
}

// 选择单词(合并英文和中文选择函数)
function selectWord(word, card, type) {
    if (!gameActive || card.classList.contains('matched')) return;

    // 取消之前选中的同类型单词
    if ((type === 'english' && selectedEnglish === card) || (type === 'chinese' && selectedChinese === card)) {
        card.classList.remove('selected');
        if (type === 'english') selectedEnglish = null;
        else selectedChinese = null;
        return;
    }

    // 取消之前选中的同类型单词
    if (type === 'english') {
        if (selectedEnglish) selectedEnglish.classList.remove('selected');
        selectedEnglish = card;
    } else {
        if (selectedChinese) selectedChinese.classList.remove('selected');
        selectedChinese = card;
    }

    // 选中当前卡片
    card.classList.add('selected');

    // 如果两种类型都选中了，则进行匹配检查
    if (selectedEnglish && selectedChinese) {
        checkMatch();
    }
}

// 检查是否匹配
function checkMatch() {
    if (!selectedEnglish || !selectedChinese) return;

    const englishWord = selectedEnglish.dataset.word;
    const chineseWord = selectedChinese.dataset.word;

    // 寻找对应的单词对
    const isMatch = wordPairs.some(pair => pair.english === englishWord && pair.chinese === chineseWord);

    if (isMatch) {
        // 匹配成功
        playAnimation('match', '匹配成功!');

        // 增加得分
        score += 10;
        updateScore();

        // 标记为已匹配
        setTimeout(() => {
            selectedEnglish.classList.add('matched');
            selectedChinese.classList.add('matched');

            // 重置选择
            selectedEnglish = null;
            selectedChinese = null;

            // 更新剩余单词数
            remainingPairs--;
            updateRemaining();

            // 检查游戏是否结束
            if (remainingPairs === 0) {
                endGame(true);
            }
        }, 500);
    } else {
        // 匹配失败
        playAnimation('error', '匹配错误!');
        
        // 取消选中状态
        setTimeout(() => {
            selectedEnglish.classList.remove('selected');
            selectedChinese.classList.remove('selected');
            selectedEnglish = null;
            selectedChinese = null;
        }, 500);
    }
}

// 播放动画(合并匹配和错误动画)
function playAnimation(type, text) {
    // 创建动画文字
    const animationText = document.createElement('div');
    animationText.className = `${type}-text`;
    animationText.textContent = text;
    animationText.style.left = '50%';
    animationText.style.top = '50%';
    animationText.style.transform = 'translate(-50%, -50%)';
    DOM.matchAnimation.appendChild(animationText);

    // 如果是匹配成功，添加彩色纸屑
    if (type === 'match') {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.width = Math.random() * 15 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            DOM.matchAnimation.appendChild(confetti);
        }
    }

    // 清理动画元素
    setTimeout(() => {
        DOM.matchAnimation.innerHTML = '';
    }, 1500);
}

// 获取随机颜色
function getRandomColor() {
    const colors = ['#ff6b8b', '#a6c0fe', '#ffccd5', '#5a7d9a', '#ff9eaa', '#799bfe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 开始游戏
function startGame() {
    if (gameActive) return;

    initGame();
    loadWordPairs(wordPairs.length > 0 ? wordPairs : defaultWordPairs);

    gameActive = true;

    // 启动计时器
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// 结束游戏
function endGame(isVictory) {
    gameActive = false;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 更新最终得分
    DOM.finalScore.textContent = score;
    DOM.finalTime.textContent = 60 - timeLeft;

    // 设置游戏结果
    DOM.gameResult.textContent = isVictory ? "恭喜胜利!" : "游戏结束";

    // 显示游戏结束界面
    setTimeout(() => {
        DOM.gameOver.classList.add('active');
    }, 1000);
}

// 更新分数显示
function updateScore() {
    DOM.score.textContent = score;
}

// 更新计时器显示
function updateTimer() {
    DOM.timer.textContent = timeLeft;
}

// 更新剩余单词数显示
function updateRemaining() {
    DOM.remaining.textContent = remainingPairs;
}

// 打乱数组顺序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 导入单词数据
function importWordData(text) {
    if (!text) {
        alert("文件内容为空!");
        return;
    }

    const lines = text.split('\n');
    const pairs = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const parts = trimmedLine.split('=');
        if (parts.length !== 2) {
            alert(`格式错误: "${line}"\n每行应为"英文=中文"格式`);
            return;
        }

        const english = parts[0].trim();
        const chinese = parts[1].trim();

        if (english && chinese) {
            pairs.push({ english, chinese });
        }
    }

    if (pairs.length === 0) {
        alert("未找到有效的单词对!");
        return;
    }

    wordPairs = pairs;

    // 重新开始游戏
    initGame();
    loadWordPairs(wordPairs);
}

// 导出单词数据为txt文件
function exportWordData() {
    if (wordPairs.length === 0) {
        alert("当前没有单词数据可以导出!");
        return;
    }

    // 将单词对转换为文本
    const text = wordPairs.map(pair => `${pair.english}=${pair.chinese}`).join('\n');

    // 创建Blob对象
    const blob = new Blob([text], { type: 'text/plain' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '单词列表.txt';

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 读取txt文件
function readTxtFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error("读取文件失败"));
        reader.readAsText(file);
    });
}

// 事件监听器
function initEventListeners() {
    DOM.startBtn.addEventListener('click', startGame);
    
    DOM.resetBtn.addEventListener('click', () => {
        initGame();
        loadWordPairs(wordPairs.length > 0 ? wordPairs : defaultWordPairs);
    });
    
    DOM.importBtn.addEventListener('click', () => DOM.fileInput.click());
    DOM.exportBtn.addEventListener('click', exportWordData);
    
    DOM.fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            alert("请选择txt文件!");
            return;
        }

        try {
            const text = await readTxtFile(file);
            importWordData(text);
        } catch (error) {
            alert("读取文件失败:" + error.message);
        }

        // 重置文件输入
        e.target.value = '';
    });
    
    DOM.playAgainBtn.addEventListener('click', () => {
        DOM.gameOver.classList.remove('active');
        startGame();
    });
}

// 初始化游戏和事件监听器
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadWordPairs(defaultWordPairs);
    initEventListeners();
});
 