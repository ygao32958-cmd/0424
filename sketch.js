// --- 新增：物件導向類別設計 ---
class StarEntity {
  constructor(data) {
    this.name = data.name;
    this.relX = data.x; // 比例座標
    this.relY = data.y;
    this.size = data.size;
    this.url = data.url;
    this.twinkleOffset = random(PI * 2);
    this.twinkleSpeed = random(0.01, 0.03);
  }

  update() {
    this.mWave = sin(frameCount * this.twinkleSpeed + this.twinkleOffset);
  }

  // 使用 Vertex 指令繪製自定義星芒形狀
  drawStarShape(x, y, radius) {
    push();
    translate(x, y);
    beginShape();
    // 透過迴圈計算 8 個頂點，創造一個四角星芒
    for (let i = 0; i < 8; i++) {
      let angle = TWO_PI / 8 * i;
      let r = i % 2 === 0 ? radius : radius * 0.4;
      let vx = cos(angle) * r;
      let vy = sin(angle) * r;
      vertex(vx, vy);
    }
    endShape(CLOSE);
    pop();
  }

  display(currentZoom) {
    let sx = this.relX * width;
    let sy = this.relY * height;
    let isLinked = (this.url && this.url !== "#");

    // 偵測是否懸停 (考慮縮放)
    let d = dist(mouseX, mouseY, (sx - mouseX) * currentZoom + mouseX, (sy - mouseY) * currentZoom + mouseY);
    let isHovered = isLinked && (d < this.size * currentZoom);

    return { sx, sy, isHovered, isLinked };
  }
}

let stars = [];
let majorStars = [
  { name: "天狼星", x: 0.2, y: 0.3, size: 15, url: "https://ygao32958-cmd.github.io/0310/" },
  { name: "織女星", x: 0.7, y: 0.2, size: 12, url: "https://ygao32958-cmd.github.io/2026-0317/" },
  { name: "天津四", x: 0.85, y: 0.5, size: 10, url: "https://ygao32958-cmd.github.io/2026-0303/" },
  { name: "大角星", x: 0.15, y: 0.75, size: 14, url: "https://ygao32958-cmd.github.io/2026-0324-1/" },
  { name: "心宿二", x: 0.5, y: 0.85, size: 16, url: "https://ygao32958-cmd.github.io/2026-0407/" },
  { name: "北極星", x: 0.48, y: 0.1, size: 10, url: "https://ygao32958-cmd.github.io/0409/" },
  { name: "參宿四", x: 0.32, y: 0.52, size: 13, url: "#" }, // 獵戶左肩
  { name: "參宿七", x: 0.42, y: 0.72, size: 12, url: "#" }, // 獵戶右腳
  { name: "牛郎星", x: 0.78, y: 0.45, size: 11, url: "#" },
  { name: "北河二", x: 0.58, y: 0.18, size: 11, url: "#" }, // 雙子頭
  { name: "北河三", x: 0.63, y: 0.22, size: 11, url: "#" }, // 雙子頭
  { name: "角宿一", x: 0.1, y: 0.85, size: 12, url: "#" },
  { name: "畢宿五", x: 0.22, y: 0.48, size: 13, url: "#" },
  // 新增補完星點
  { name: "參宿五", x: 0.4, y: 0.54, size: 10, url: "#" },  // 獵戶右肩
  { name: "參宿六", x: 0.34, y: 0.70, size: 10, url: "#" },  // 獵戶左腳
  { name: "參宿一", x: 0.35, y: 0.61, size: 9, url: "#" },   // 腰帶左
  { name: "參宿二", x: 0.37, y: 0.62, size: 9, url: "#" },   // 腰帶中
  { name: "參宿三", x: 0.39, y: 0.63, size: 9, url: "#" },   // 腰帶右
  { name: "軒轅十四", x: 0.12, y: 0.65, size: 12, url: "#" }, // 用於春季三角
  { name: "井宿三", x: 0.54, y: 0.35, size: 9, url: "#" },  // 雙子身
  { name: "井宿一", x: 0.59, y: 0.38, size: 9, url: "#" }   // 雙子身
];
let meteors = [];
let nebulas = [];
let satellites = [];
// 定義星座：包含名稱與連結的星星索引
let constellations = [
  { name: "夏季大三角 (Summer Triangle)", links: [[1, 2], [2, 8], [8, 1]] }, // 織女-天津四-牛郎
  { name: "獵戶座 (Orion)", links: [
      [6, 13], [13, 17], [17, 16], [16, 15], [15, 17], // 肩部與腰帶
      [16, 6], [16, 14], [17, 7] // 身體至腳部
    ] },
  { name: "雙子座 (Gemini)", links: [[9, 19], [10, 20], [9, 10]] },
  { name: "春季三角 (Spring Triangle)", links: [[3, 11], [11, 18], [18, 3]] },
  { name: "冬季六邊形 (Winter Hexagon)", links: [[0, 7], [7, 12], [12, 10], [10, 0]] }
];
let currentZoom = 1;
let signalStrength = 0;
let scopeSize = 300; // 望遠鏡視野大小改為變數
let scopeSlider; // 視野滑桿

// 創意元素：數位雜訊種子
let noiseOffset = 0;

// 獲取 HTML 彈出視窗元素
let starPopupOverlay;
let popupStarName;
let popupIframe;
let aboutOverlay;
let helpPanel;
let isAboutVisible = false;
let showConstellations = true; // 控制星座顯示的開關

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 禁用右鍵選單
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  
  // 生成背景星雲 (增添色彩層次)
  for (let i = 0; i < 8; i++) {
    nebulas.push({
      x: random(1),
      y: random(1),
      r: random(300, 700),
      colorSeed: random(1000), // 為每片星雲提供獨立的色彩變換種子
      parallax: random(0.1, 0.3) // 視差強度，數值越大位移越明顯
    });
  }

  // 生成背景小星星
  for (let i = 0; i < 400; i++) {
    let starColors = [color(155, 176, 255), color(170, 191, 255), color(202, 215, 255), color(248, 247, 255), color(255, 244, 234), color(255, 210, 161), color(255, 125, 125)];
    stars.push({
      x: random(1), // 使用比例座標 (0~1)
      y: random(1),
      size: random(1, 3),
      bright: random(100, 255),
      twinkleOffset: random(PI * 2),
      twinkleSpeed: random(0.02, 0.05),
      col: random(starColors)
    });
  }

  // 初始化人造衛星
  for (let i = 0; i < 2; i++) {
    satellites.push({
      x: random(width),
      y: random(height),
      speed: random(1, 2),
      angle: random(PI / 4)
    });
  }

  // --- 運用 Array.map 與 Class 初始化物件 ---
  majorStars = majorStars.map(data => new StarEntity(data));

  // 初始化 HTML 彈出視窗元素
  starPopupOverlay = select('#star-popup-overlay');
  popupStarName = select('#popup-star-name');
  popupIframe = select('#popup-iframe');
  let popupBackButton = select('#popup-back-button');

  // 為返回按鈕添加事件監聽器
  if (popupBackButton) {
    popupBackButton.mousePressed(hideStarPopup);
  }
  starPopupOverlay.style('display', 'none'); // 確保初始狀態是隱藏的

  // --- 新增：觀星指南 (右上角) ---
  helpPanel = createDiv(`
    <div style="font-family: 'monospace'; color: #50ff32; background: rgb(5, 10, 20); padding: 15px; border: 1px solid #50ff32; border-radius: 8px; line-height: 1.4; width: 220px; box-shadow: 0 0 15px rgba(80,255,50,0.3);">
      <b style="font-size: 16px; display: block; margin-bottom: 8px; border-bottom: 1px solid #50ff32;">🔭 觀測系統指令</b>
      <div style="font-size: 12px; margin-bottom: 10px;">
        • [移動] 定位深空座標<br>
        • [左鍵] 讀取星體故事<br>
        • [右鍵] 啟動 3.0X 數位變焦<br>
        • [接近] 自動顯示星座連線
      </div>
      <div style="font-size: 12px; margin-bottom: 5px;">視野孔徑調節：</div>
      <div id="slider-container"></div>
      <div id="const-btn-container" style="margin-top: 10px;"></div>
    </div>
  `);
  helpPanel.position(width - 260, 20);

  // 初始化視野直徑滑桿
  helpPanel.style('z-index', '2000'); // 確保面板在最上層
  scopeSlider = createSlider(150, 600, 300);
  scopeSlider.parent(select('#slider-container'));
  scopeSlider.style('width', '100%');

  // 在面板中建立切換按鈕
  let toggleConstBtn = createButton('切換星座顯示');
  toggleConstBtn.parent(select('#const-btn-container'));
  toggleConstBtn.style('background', 'rgba(80, 255, 50, 0.2)');
  toggleConstBtn.style('color', '#50ff32');
  toggleConstBtn.style('border', '1px solid #50ff32');
  toggleConstBtn.style('padding', '5px 10px');
  toggleConstBtn.style('cursor', 'pointer');
  toggleConstBtn.style('font-family', 'monospace');
  toggleConstBtn.style('border-radius', '3px');
  toggleConstBtn.mousePressed(() => {
    showConstellations = !showConstellations;
    updateConstellationButtonState(); // 更新按鈕狀態
  });
  updateConstellationButtonState(); // 初始化按鈕狀態

  // 輔助函數：更新星座顯示按鈕的視覺狀態
  function updateConstellationButtonState() {
    if (showConstellations) {
      toggleConstBtn.style('background', '#50ff32'); // 實心綠色
      toggleConstBtn.style('color', '#000'); // 黑色文字
      toggleConstBtn.html('星座顯示: 開啟');
    } else {
      toggleConstBtn.style('background', 'rgba(80, 255, 50, 0.2)'); // 半透明綠色
      toggleConstBtn.style('color', '#50ff32'); // 綠色文字
      toggleConstBtn.html('星座顯示: 關閉');
    }
  }

  // --- 新增：關於作品按鈕與彈窗 ---
  let aboutBtn = createButton('關於作品介紹');
  aboutBtn.position(20, 20); // 保持在左上角
  aboutBtn.style('padding', '10px 20px');
  aboutBtn.style('background', 'rgba(26, 42, 68, 0.8)');
  aboutBtn.style('color', '#82f0ff');
  aboutBtn.style('border', '1px solid #82f0ff');
  aboutBtn.style('border-radius', '20px');
  aboutBtn.style('cursor', 'pointer');
  aboutBtn.mousePressed(toggleAbout);

  aboutOverlay = createDiv(`
    <div style="background: rgba(5, 10, 25, 0.7); color: #fff; padding: 40px; border: 2px solid #82f0ff; max-width: 600px; border-radius: 15px; font-family: sans-serif; box-shadow: 0 0 30px rgba(130,240,255,0.4);">
      <h2 style="color: #82f0ff; border-bottom: 2px solid #82f0ff; padding-bottom: 15px;">數位觀測：指令建構的宇宙</h2>
      <p>本系統嘗試將純粹的程式指令轉化為感性的觀星體驗，結合天文觀測的嚴謹感與數位視覺的律動：</p>
      <ul style="line-height: 2; font-size: 15px;">
        <li><b>物件導向 (Class)</b>：建立 <code>StarEntity</code> 類別，將每顆星體的座標、閃爍週期與數據行為封裝，讓上百顆星點具備獨立生命力。</li>
        <li><b>自定義幾何 (Vertex)</b>：運用 <code>beginShape</code> 與 <code>vertex</code> 指令精準計算頂點座標，取代圓圈，繪製出具備光芒放射感的專業觀測星芒。</li>
        <li><b>陣列與迴圈 (Array/Loop)</b>：利用動態陣列儲存繁星與流星，並透過 <code>For</code> 迴圈進行高效能的即時運算，呈現星雲層疊與視差位移的層次感。</li>
        <li><b>創作理念</b>：透過數位雜訊與座標運算，模擬人類利用望遠鏡探索深空的過程，將冷酷的程式碼交織成充滿詩意的夏季星圖。</li>
      </ul>
      <button id="closeAbout" style="margin-top: 20px; padding: 12px 30px; background: #82f0ff; border: none; cursor: pointer; color: #000; font-weight: bold; border-radius: 5px;">返回觀測</button>
    </div>
  `);
  aboutOverlay.style('position', 'fixed');
  aboutOverlay.style('top', '0');
  aboutOverlay.style('left', '0');
  aboutOverlay.style('width', '100%');
  aboutOverlay.style('height', '100%');
  aboutOverlay.style('display', 'none');
  aboutOverlay.style('justify-content', 'center');
  aboutOverlay.style('align-items', 'center');
  aboutOverlay.style('backdrop-filter', 'blur(10px)');
  aboutOverlay.style('-webkit-backdrop-filter', 'blur(10px)');
  aboutOverlay.style('z-index', '3000');
  
  select('#closeAbout').mousePressed(toggleAbout);
}

function draw() {
  background(5, 10, 20);

  // 獲取滑桿數值更新視野大小
  scopeSize = scopeSlider.value();

  // 處理縮放數值 (右鍵長按時放大)
  let targetZoom = (mouseIsPressed && mouseButton === RIGHT) ? 3.0 : 1;
  currentZoom = lerp(currentZoom, targetZoom, 0.15);

  // --- 第一步：繪製星空內容 ---
  push();
  // 以滑鼠為中心進行縮放
  translate(mouseX, mouseY);
  scale(currentZoom);
  translate(-mouseX, -mouseY);

  // --- 創意元素：星系連線與名稱顯示 ---
  let drawnLabelPositions = []; // 用於紀錄已繪製標籤的位置，避免重疊

  if (showConstellations) {
    for (let c of constellations) {
      // 計算星座的中心點，用來判定望遠鏡是否對準
      let totalX = 0, totalY = 0;
      let minY = height; // 紀錄星座中最上方的 Y 座標，用來放置標籤
      let starCount = 0;
      let processedIndices = new Set();
      for (let link of c.links) {
        processedIndices.add(link[0]);
        processedIndices.add(link[1]);
      }
      processedIndices.forEach(idx => {
        let sx = majorStars[idx].relX * width;
        let sy = majorStars[idx].relY * height;
        totalX += sx;
        totalY += sy;
        if (sy < minY) minY = sy; // 尋找該星群中垂直位置最高的點
        starCount++;
      });
      let centerX = totalX / starCount;
      let centerY = totalY / starCount;

      let d = dist(mouseX, mouseY, centerX, centerY);
      let alpha = map(d, 0, 200, 255, 0, true); // 調整偵測半徑與透明度，更適合望遠鏡觀察

      if (alpha > 0) {
        let pulse = (0.7 + 0.3 * sin(frameCount * 0.05));
        stroke(80, 180, 255, alpha * pulse * 0.6); // 降低連線亮度，避免擋住星星核心
        strokeWeight(0.8 / currentZoom);
        for (let link of c.links) {
          line(majorStars[link[0]].relX * width, majorStars[link[0]].relY * height, 
               majorStars[link[1]].relX * width, majorStars[link[1]].relY * height);
        }
        
        // 計算標籤位置並處理重疊
        let labelX = centerX;
        let labelY = minY - 50 / currentZoom;
        
        // 智慧避讓：擴大避讓區域，確保星座名稱完全避開右上角面板 (面板區域約為寬 260px, 高 400px)
        if (labelX > width - 350 && labelY < 400) {
          labelX -= 250; // 加大向左偏移量
          labelY += 100; // 加大向下偏移量
        }

        // 簡單的重疊避讓邏輯：如果與畫面上已有的標籤太近，則向上偏移位置
        let maxAttempts = 5;
        while (maxAttempts > 0) {
          let overlapping = drawnLabelPositions.some(pos => dist(labelX, labelY, pos.x, pos.y) < 60 / currentZoom);
          if (!overlapping) break;
          labelY -= 35 / currentZoom; // 向上堆疊
          maxAttempts--;
        }
        drawnLabelPositions.push({ x: labelX, y: labelY });

        // 顯示星座名稱
        push();
        fill(130, 240, 255, alpha * pulse);
        noStroke();
        textAlign(CENTER);
        textSize(20 / currentZoom);
        text(c.name, labelX, labelY);
        pop();
      }
    }
  }

  // --- 創意元素：人造衛星 ---
  for (let sat of satellites) {
    sat.x += cos(sat.angle) * sat.speed;
    sat.y += sin(sat.angle) * sat.speed;
    if (sat.x > width) sat.x = -10;
    fill(255, frameCount % 20 < 10 ? 255 : 50); // 閃爍效果
    circle(sat.x, sat.y, 2);
  }

  // 畫背景星雲 (加入視差位移)
  for (let n of nebulas) {
    // 根據滑鼠相對於畫面中心的距離來計算偏移
    let offsetX = (mouseX - width / 2) * n.parallax;
    let offsetY = (mouseY - height / 2) * n.parallax;

    // 動態色彩變換：利用 noise 產生平滑流動感 (類似極光)
    let r = map(noise(n.colorSeed + frameCount * 0.005), 0, 1, 20, 60);
    let g = map(noise(n.colorSeed + 500 + frameCount * 0.005), 0, 1, 10, 40);
    let b = map(noise(n.colorSeed + 1000 + frameCount * 0.005), 0, 1, 60, 130);
    fill(r, g, b, 12); // 保持低透明度以疊加出層次感

    noStroke();
    circle(n.x * width + offsetX, n.y * height + offsetY, n.r);
  }

  // 畫背景小星星
  noStroke();
  for (let s of stars) {
    let wave = sin(frameCount * s.twinkleSpeed + s.twinkleOffset);
    let tBright = s.bright * (0.6 + 0.4 * wave);
    // 背景星星散光效果
    fill(red(s.col), green(s.col), blue(s.col), tBright * 0.2);
    circle(s.x * width, s.y * height, s.size * (2.0 + wave * 0.5));
    // 星星核心
    fill(red(s.col), green(s.col), blue(s.col), tBright);
    circle(s.x * width, s.y * height, s.size);
  }

  // 畫主要大星星
  let anyStarHovered = false; // 用於判斷是否需要切換滑鼠指標
  // --- 運用 For Loop 遍歷物件陣列 ---
  for (let s of majorStars) {
    s.update();
    let { sx, sy, isHovered, isLinked } = s.display(currentZoom);

    if (isHovered) anyStarHovered = true;

    noStroke();

    if (isLinked) {
      // --- 創意元素：連結星星的科技感標記 ---
      push();
      translate(sx, sy);
      rotate(frameCount * 0.02);
      noFill();
      stroke(130, 240, 255, 150 + 50 * s.mWave);
      strokeWeight(1.5 / currentZoom);
      let bSize = s.size * 2 + 5 * s.mWave;
      line(-bSize, -bSize, -bSize + 5, -bSize); line(-bSize, -bSize, -bSize, -bSize + 5);
      line(bSize, -bSize, bSize - 5, -bSize); line(bSize, -bSize, bSize, -bSize + 5);
      line(bSize, bSize, bSize - 5, bSize); line(bSize, bSize, bSize, bSize - 5);
      line(-bSize, bSize, -bSize + 5, bSize); line(-bSize, bSize, -bSize, bSize - 5);
      pop();

      // 核心光暈強化
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'rgba(130, 240, 255, 0.8)';
      
      fill(255, 255, 220, 80); 
      if (isHovered) {
        let hoverGlow = 150 + 50 * sin(frameCount * 0.2);
        fill(255, 255, 100, hoverGlow * 0.4);
        circle(sx, sy, s.size * (6 + sin(frameCount * 0.1) * 2));
      }
      
      // 使用自定義 Vertex 形狀替代普通圓圈
      fill(255, 255, 220, 200);
      s.drawStarShape(sx, sy, s.size * (1.5 + s.mWave * 0.5));
      
      fill(255); // 核心，明亮白色
      circle(sx, sy, s.size * (0.8 + s.mWave * 0.1)); 
      
      drawingContext.shadowBlur = 0; // 重設防止影響其他繪圖
    } else {
      fill(180, 200, 255, 60); 
      circle(sx, sy, s.size * (2 + s.mWave * 0.3)); 
      fill(200); // 核心，較暗的白色
      circle(sx, sy, s.size); // 核心無脈動
    }

    // 名字標籤 (名字不隨縮放變太大，稍微調整)
    textAlign(CENTER);
    textSize(14 / currentZoom); 
    fill(200);
    // 懸停時名稱變為金色，平時為淺灰色
    fill(isHovered ? color(255, 220, 0) : 200);
    text(s.name, sx, sy + s.size + 15 / currentZoom);
  }

  // 根據是否有懸停在連結星星上切換游標
  if (anyStarHovered) cursor(HAND); else cursor(ARROW);

  // 處理與繪製流星
  if (random(1) < 0.01) { // 1% 機率產生流星
    meteors.push({
      x: random(width), y: random(height),
      vx: random(5, 10), vy: random(5, 10),
      life: 255,
      color: color(random(150, 255), random(200, 255), 255), // 為每顆流星分配一個亮麗的隨機色
      history: [] // 紀錄路徑以製作殘影
    });
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    let m = meteors[i];
    
    // 更新軌跡歷史
    m.history.push({x: m.x, y: m.y});
    if (m.history.length > 12) m.history.shift();
    
    // 使用原生 Canvas API 建立線性漸層
    let headX = m.x;
    let headY = m.y;
    let c = m.color;

    // 1. 空間扭曲效果 (Spatial Distortion) - 模擬震波環
    noFill();
    strokeWeight(1);
    stroke(red(c), green(c), blue(c), m.life * 0.1);
    circle(headX, headY, 15 + (255 - m.life) * 0.1); 
    stroke(red(c), green(c), blue(c), m.life * 0.05);
    circle(headX, headY, 25 + (255 - m.life) * 0.2);

    // 2. 拖尾殘影 (Trailing Afterimage) - 繪製歷史路徑
    for (let j = 0; j < m.history.length - 1; j++) {
      let p1 = m.history[j];
      let p2 = m.history[j+1];
      let alpha = map(j, 0, m.history.length, 0, m.life * 0.6);
      stroke(red(c), green(c), blue(c), alpha);
      strokeWeight(map(j, 0, m.history.length, 1, 4));
      line(p1.x, p1.y, p2.x, p2.y);
    }

    let tailX = m.x - m.vx * 12; // 增加尾巴長度係數
    let tailY = m.y - m.vy * 12;

    let grad = drawingContext.createLinearGradient(headX, headY, tailX, tailY);
    // 設定漸層點：從頭部（亮色 + 當前生命值透明度）到尾部（完全透明）
    grad.addColorStop(0, `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${m.life / 255})`);
    grad.addColorStop(1, `rgba(${red(c)}, ${green(c)}, ${blue(c)}, 0)`);

    drawingContext.strokeStyle = grad;
    strokeWeight(2);
    line(headX, headY, tailX, tailY);

    m.x += m.vx; m.y += m.vy;
    m.life -= 5;
    if (m.life <= 0) meteors.splice(i, 1);
  }
  pop();

  // --- 第二步：製作望遠鏡遮罩 ---
  // 使用「超粗圓環法」：畫一個巨大的黑色空心圓，邊框粗到足以遮住螢幕其餘部分
  push();
  noFill();
  stroke(0); 
  let thickness = max(width, height) * 1.5; // 確保厚度蓋住全螢幕
  strokeWeight(thickness);
  // 修正：將遮罩直徑稍微加大，避免遮住金屬鏡框邊緣
  circle(mouseX, mouseY, (scopeSize + 10) + thickness);
  pop();

  // --- 第三步：繪製金屬鏡框 ---
  drawTelescopeFrame(mouseX, mouseY, scopeSize);

  // --- 第四步：繪製專業十字準星與刻度 ---
  drawReticle(mouseX, mouseY, scopeSize);

  // --- 第五步：繪製數位座標顯示 ---
  drawHUD(mouseX, mouseY);
}

function drawTelescopeFrame(x, y, diameter) {
  push();
  noFill();
  
  // 1. 內側模糊陰影 (讓邊緣看起來不那麼銳利)
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0,0,0,0.8)';
  stroke(80, 80, 90); // 提高亮度確保可見
  strokeWeight(5);
  circle(x, y, diameter);
  
  // 2. 金屬鏡框主體
  drawingContext.shadowBlur = 0; // 關閉陰影以畫精細線條
  stroke(180, 185, 190); // 調亮金屬色
  strokeWeight(8);
  circle(x, y, diameter + 4);
  
  // 3. 鏡框高光 (增加立體感)
  stroke(255);
  strokeWeight(1.5);
  circle(x, y, diameter + 8);
  pop();
}

function drawReticle(x, y, d) {
  push();
  stroke(255, 255, 0, 200); // 改用黃色準星，對比度更高
  strokeWeight(1);
  noFill();

  // 中央圓圈
  circle(x, y, 40);
  circle(x, y, 2);

  // 十字長線 (不穿透中心圓)
  line(x, y - d/2, x, y - 30); // Top
  line(x, y + 30, x, y + d/2); // Bottom
  line(x - d/2, y, x - 30, y); // Left
  line(x + 30, y, x + d/2, y); // Right

  // 周圍度數刻度
  stroke(255, 255, 255, 150);
  for (let a = 0; a < TWO_PI; a += PI/12) {
    let x1 = x + cos(a) * (d/2 - 5);
    let y1 = y + sin(a) * (d/2 - 5);
    let x2 = x + cos(a) * (d/2 - 15);
    let y2 = y + sin(a) * (d/2 - 15);
    line(x1, y1, x2, y2);
  }

  // 方位標示
  fill(255, 255, 0);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  text("N", x, y - d/2 + 25);
  fill(200);
  text("S", x, y + d/2 - 25);
  text("E", x + d/2 - 25, y);
  text("W", x - d/2 + 25, y);
  pop();
}

function drawHUD(x, y) {
  push();
  fill(50, 255, 50, 255); // 更亮的數位綠
  textFont('monospace');
  textSize(12);
  let zoomText = currentZoom.toFixed(1) + "X";
  
  // 更新訊號強度 (靠近大星星時增強)
  let maxD = 1000;
  for (let s of majorStars) {
    let d = dist(mouseX, mouseY, (s.relX * width - mouseX) * currentZoom + mouseX, (s.relY * height - mouseY) * currentZoom + mouseY);
    maxD = min(maxD, d);
  }
  signalStrength = lerp(signalStrength, map(maxD, 0, 200, 100, 0, true), 0.1);

  // --- 動態位置邏輯：避免與右側面板重疊 ---
  let hudX;
  // 調整判定閾值：將翻轉判定範圍擴大至 y < 400 以對應面板高度
  if (x + scopeSize / 2 + 180 > width - 260 && y < 400) { 
    hudX = x - scopeSize / 2 - 20;
    textAlign(RIGHT);
  } else {
    hudX = x + scopeSize / 2 + 20;
    textAlign(LEFT);
  }

  text("ZOOM: " + zoomText, hudX, y - 20);
  text("RA: " + nf(map(x, 0, width, 0, 24), 2, 2) + "h", hudX, y);
  text("DEC: " + nf(map(y, 0, height, 90, -90), 2, 2) + "°", hudX, y + 20);
  
  // 訊號強度條
  noFill();
  stroke(0, 255, 0, 150);
  let barX = (textAlign().horizontal === LEFT) ? hudX : hudX - 60;
  rect(barX, y + 35, 60, 5);
  fill(0, 255, 0, 255);
  rect(barX, y + 35, map(signalStrength, 0, 100, 0, 60), 5);
  
  // 放大時的數位掃描線效果
  if (currentZoom > 1.1) {
    stroke(0, 200, 0, 30);
    for (let i = -scopeSize/2; i < scopeSize/2; i += 4) {
      line(x - scopeSize/2, y + i, x + scopeSize/2, y + i);
    }
    
    // 數位噪點干擾效果
    if (random(1) < 0.05) {
      stroke(0, 255, 0, 50);
      let ry = y + random(-scopeSize/2, scopeSize/2);
      line(x - scopeSize/2, ry, x + scopeSize/2, ry + random(-5, 5));
    }
  }
  pop();
}

function mousePressed() {
  if (mouseButton === LEFT) {
    for (let s of majorStars) {
      let sx = s.relX * width;
      let sy = s.relY * height;
      let d = dist(mouseX, mouseY, (sx - mouseX) * currentZoom + mouseX, (sy - mouseY) * currentZoom + mouseY);
      if (d < s.size * currentZoom) {
        if (s.url && s.url !== "#") { // 只有有有效連結的星星才能點擊
          showStarPopup(s);
        }
        return; // 點擊到一個星星後就停止檢查
      }
    }
  }
}

// 顯示星星資訊彈出視窗
function showStarPopup(starData) {
  if (starPopupOverlay && popupStarName && popupIframe) {
    popupStarName.html(starData.name);
    popupIframe.attribute('src', starData.url); // 直接設定 iframe 來源
    starPopupOverlay.style('display', 'flex'); // 顯示彈出視窗
  }
}

// 隱藏星星資訊彈出視窗
function hideStarPopup() {
  if (starPopupOverlay && popupIframe) {
    starPopupOverlay.style('display', 'none'); // 隱藏彈出視窗
    popupIframe.attribute('src', 'about:blank'); // 關閉時清空內容，節省效能並停止視窗內的音效
  }
}

function toggleAbout() {
  isAboutVisible = !isAboutVisible;
  aboutOverlay.style('display', isAboutVisible ? 'flex' : 'none');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (helpPanel) helpPanel.position(width - 260, 20);
}
