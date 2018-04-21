window.onload = () =>
{
  /* 定数 */
  const MORIYA_RUN_URI = './work/moriya_run.html';
  /* 共通変数 */
  let prevX = null;
  let result = null;
  let meX = null;
  let scrollDirection = null;
  let snows = []; // 雪格納用

  /* DOM取得 */
  let moveLayer = [];
  moveLayer.push(document.getElementById('moveLayer1'));
  moveLayer.push(document.getElementById('moveLayer2'));
  moveLayer.push(document.getElementById('moveLayer3'));
  const body    = document.getElementsByTagName('body')[0];
  const title = document.getElementsByClassName('firstContentBlock')[0];
  const me = document.getElementsByClassName('meSprite')[0];
  const meContainer = document.getElementsByClassName('me')[0];
  const meContent = document.getElementsByClassName('meContent')[0];

  // スプライト切り替え区分値取得
  const sp1 = parseInt(window.getComputedStyle(document.getElementById('specialZone1'), null).getPropertyValue('left'));
  const sp2 = parseInt(window.getComputedStyle(document.getElementById('specialZone2'), null).getPropertyValue('left'));
  const sp3 = parseInt(window.getComputedStyle(document.getElementById('specialZone3'), null).getPropertyValue('left'));
  const sp4 = parseInt(window.getComputedStyle(document.getElementById('specialZone4'), null).getPropertyValue('left'));
  const sp5 = parseInt(window.getComputedStyle(document.getElementById('specialZone5'), null).getPropertyValue('left'));
  const sp6 = parseInt(window.getComputedStyle(document.getElementById('specialZone6'), null).getPropertyValue('left'));
  const sp7 = parseInt(window.getComputedStyle(document.getElementById('specialZone7'), null).getPropertyValue('left'));
  const dram = document.getElementById('dram').getBoundingClientRect().x;
  const modal = document.getElementsByClassName('modal')[0];
  const closeButton = document.getElementsByClassName('closeButton')[0];
  const gameStart = document.getElementById('gameStart');

  // DOM生成・追加、属性追加、取得
  body.insertAdjacentHTML('afterbegin', '<canvas id="snow"> </canvas>');
  let canvas = document.getElementById('snow');


  function checkCenter()
  {
    let center = ((window.innerWidth - title.clientWidth) / 2);
    title.setAttribute('style', 'left: ' + center + 'px');
  }

  function checkScrollDirection()
  {
    prevX < window.pageYOffset ? result = 'Right' : result = 'Left';
    prevX = window.pageYOffset;
    return result;
  }

  function checkDramIn()
  {
    if (meX > (dram + (meContainer.clientWidth / 2)))
    {
      meContent.setAttribute('style', 'bottom: 20%');
      modal.classList.add('modalEnable');
    }
    else
    {
      meContent.setAttribute('style', 'bottom: 18%');
      modal.classList.remove('modalEnable');
    }
  }

  /* イベントリスナー */
  body.addEventListener('touchmove', () =>
  {  // スクロールイベント - 1
    for (let i = 0; i < moveLayer.length; i++) {
      setScrollController(moveLayer[i], window.scrollY);
    }
  });


  window.addEventListener('scroll', () =>
  {  // スクロールイベント - 2
    for (let i = 0; i < moveLayer.length; i++) {
      setScrollController(moveLayer[i], window.scrollY);
    }
    setSpriteController();
    checkDramIn();
  });

  /* ジャンプ */
  meContainer.addEventListener('click', () => {
    meContainer.setAttribute('id', 'meContainerMoveJump');
    me.setAttribute('id', 'meMoveJump');
  });

  window.addEventListener('webkitAnimationEnd', () => {
    meContainer.removeAttribute('id');
    me.removeAttribute('id');
  });

  closeButton.addEventListener('click', () => {
    modal.classList.remove('modalEnable');
  });

  gameStart.addEventListener('click', () => {
    location.href = MORIYA_RUN_URI;
  })

  /* 水平スクロール */
  function setScrollController(dom, scrollX)
  {
    dom.setAttribute('style', 'left: -' + scrollX + 'px');
  }

  /* スプライト切り替え */
  function setSpriteController()
  {
    meX = ((window.innerWidth  / 2) + window.scrollY);
    scrollDirection = checkScrollDirection();

    if (meX >= sp1 && meX < sp2)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('infantMeMove' + scrollDirection));
    }
    else if (meX >= sp2 && meX < sp3)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('elementaryMeMove' + scrollDirection));
    }
    else if (meX >= sp3 && meX < sp4)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('middleMeMove' + scrollDirection));
    }
    else if (meX >= sp4 && meX < sp5)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('highMeMove' + scrollDirection));
    }
    else if (meX >= sp5 && meX < sp6)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('collegeMeMove' + scrollDirection));
    }
    else if (meX >= sp6 && meX < sp7)
    {
      me.removeAttribute('id');
      me.setAttribute('id', ('societyMeMove' + scrollDirection));
    }
    else
    {
      me.setAttribute('id', ('meMove' + scrollDirection));
    }
  }

  /* 雪描画 */
  /* 2Dコンテキストを取得 */
  let ctx = canvas.getContext('2d');

  /* 画面幅取得・コンテキスト幅設定 */
  let w = ctx.canvas.width = window.innerWidth;
  let h = ctx.canvas.height = window.innerHeight;

  /* ランダム値生成 */
  function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* 雪生成 - 2 */
  function Snow() {
  this.x = getRandomArbitary(0, w);
  this.y = getRandomArbitary(-h, 0);
  this.radius = getRandomArbitary(0.5, 15.0);
  this.wind = getRandomArbitary(-0.5, 3.0); // x軸の移動速度
  this.speed = getRandomArbitary(1, 3); // y軸の移動速度
  }

  /* 雪描画 - 2 */
  Snow.prototype.draw = function() {
    const gradation = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius * 0.6,
      this.x,
      this.y,
      this.radius
    );
    gradation.addColorStop(0,'rgba(225, 225, 225, 0.8)');
    gradation.addColorStop(0.5,'rgba(225, 225, 225, 0.2)');
    gradation.addColorStop(1,'rgba(225, 225, 225, 0.1)');

    ctx.beginPath();
    ctx.fillStyle = gradation;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  /* 落雪速度 - 2 */
  Snow.prototype.move = function() {
    this.x += this.wind;
    this.y += this.speed;

    if (this.y > h) {
      this.x = getRandomArbitary(0, h);
      this.y = 0;
    }
  }

  /* 雪生成 - 1 */
  function createSnow(count) {
    for (let i = 0; i < count; i++) {
      snows[i] = new Snow();
    }
  }

  /* 雪描画 - 1 */
  function draw() {
    // 描画の初期化
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();

    for(let i = 0; i < snows.length; i++) {
      snows[i].draw();
    }
  }

  /* 落雪速度 -1 */
  function move() {
    for (let i = 0; i < snows.length; i++) {
      snows[i].move();
    }
  }

  /* 反復処理 */
  function loop() {
    draw();
    move();
    handle = window.requestAnimationFrame(loop);
  }

  /* 初期表示時、最上部へ */
  function openningPageTop() {
    // スクロール量取得
    let scroll = document.body.scrollTop || document.documentElement.scrollTop;
    if(scroll) {
      scrollTo(0, scroll/=1.025); // スクロール量設定
      setTimeout(openningPageTop, 5); // 5msごとのスクロール
  　}
  }

  /* 初期処理 */
  createSnow(10);
  loop();
  checkCenter();
  openningPageTop();
}
