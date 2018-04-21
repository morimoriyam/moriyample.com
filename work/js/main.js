window.onload = () =>
{
    enchant();

    /**
     * マップオブジェクト
     * @param args
     *   [0]: スプライトの横幅、縦幅
     *   [1]: スプライトURL
     *   [2]: マップデータ
     *   [3]: マップ衝突判定用データ
     */
    const Map = enchant.Class.create(enchant.Map,
    {
        initialize: function(args)
        {
            enchant.Map.call(this, args[0], args[0]);
            this.image = core.assets[args[1]];
            this.loadData(args[2]); // マップデータロード
            this.collisionData = args[3]; // 衝突判定データロード
        }
    });

    /**
     * プレイヤーオブジェクト
     * @param args
     *   [0]: スプライトの横幅、縦幅
     *   [1]: スタート時のx座標
     *   [2]: スタート時のy座標
     *   [3]: スプライトURL
     *   [4]: 移動用フレーム遷移
     *   [5]: ジャンプ用フレーム遷移
     *   [6]: ｘ軸加速度
     *   [7]: y軸加速度
     *   [8]: ジャンプ量
     *   [9]: ジャンプ量上限
     * @param map マップオブジェクト
     */
    const Player = enchant.Class.create(enchant.Sprite,
    {
        initialize: function(args, map)
        {
            enchant.Sprite.call(this, args[0], args[0]);
            this.x = args[1];
            this.y = args[2];
            this.vx = 0;
            this.vy = 0;
            this.image = core.assets[args[3]];
            this.frame = args[4];
            this.isJump = true;
            this.jumpHeight = args[8];
            this.jumpCount = 0;
            this.jumpHeightLimit = args[9];

            this.addEventListener('enterframe', function(e)
            {
                this.vy = args[6]; // y軸加速度
                this.vx = args[7]; // x軸加速度

                // 着地判定
                if(!this.possibleJump && map.hitTest(this.x + this.vx + 24, this.y + this.vy + 40) && map.hitTest(this.x + this.vx + 18, this.y + this.vy + 40))
                {
                    this.vy -= args[7];
                    this.isJump = false;
                    this.jumpCount = 0;
                }

                // ジャンプ中の場合、規定のジャンプ量までジャンプ
                if(this.isJump && this.possibleJump)
                {
                    this.vy -= this.jumpHeight;
                    this.jumpCount++;
                }

                // ジャンプ上限判定
                if(this.isJump && this.jumpCount >= this.jumpHeightLimit) this.possibleJump = false;

                // 移動可否判定
                if(map.hitTest(this.x + this.vx + 38 , this.y + this.vy + 40))
                {
                    this.vx -= args[7];
                }

                // ジャンプ可否判定
                if (this.isJump)
                {
                    if(map.hitTest(this.x + this.vx + 24, this.y + this.vy + 15))
                    {
                        this.vy += this.jumpHeight;
                        this.possibleJump = false;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
            });
        },

        jump: function()
        {
            this.isJump = true; // 複数回のジャンプ対策
            this.possibleJump = true; // 複数回のジャンプ対策
        },

        /**
         * 敵衝突時、スプライト点滅
         * @param t 点滅時間
         * @param lifeLabel ライフオブジェクト
         */
        blink: function(t, lifeLabel)
        {
            // 規定の時間スプライト点滅
            this.tl
            .clear()
            .repeat(function()
            {
                this.visible = !this.visible;
            }, t)
            .then(function()
            {
                this.visible = true;
            });

            lifeLabel.life--; // ライフの減少
        }
    });

    /**
     * 衝突判定用プレイヤーオブジェクト
     * @param args
     *   [0]: スプライトの横幅、縦幅
     *   [1]: スタート時のx座標
     *   [2]: スタート時のy座標
     * @param map マップオブジェクト
     */
    const PlayerCollision = enchant.Class.create(enchant.Sprite,
    {
        initialize: function(args, map)
        {
            enchant.Sprite.call(this, 20, 34);
            this.x = args[1] + 10;
            this.y = args[2] + 11;
        }
    });

    /**
     * 敵オブジェクト
     * @param args
     *   [0]: スプライトの横幅、縦幅
     *   [1]: スタート時のx座標
     *   [2]: スタート時のy座標
     *   [3]: スプライトURL
     *   [4]: 移動用フレーム遷移
     *   [5]: x軸加速度
     *   [6]: y軸加速度
     * @param player プレイヤーオブジェクト
     * @param map マップオブジェクト
     */
    const Enemy = enchant.Class.create(enchant.Sprite,
    {
        initialize: function(args, player, map)
        {
            enchant.Sprite.call(this, args[0], args[0]);
            this.x = (player.x + args[1]);
            this.y = args[2];
            this.vx = args[5];
            this.vy = args[6];
            this.name = randomName();
            this.image = core.assets[args[3]];
            this.frame = args[4];
            this.turnFlag = 'right';
            this.landingFlag = false;
            this.deadFlag = false;

            this.addEventListener('enterframe', function(e)
            {
                this.vy = args[6];

                // 下の衝突
                if (map.hitTest(this.x + this.vx + 24, this.y + this.vy + 46))
                {
                    this.vy = 0;
                }

                // 左の衝突
                if(this.turnFlag === 'right' && map.hitTest(this.x - this.vx + 7 , this.y + this.vy + 40))
                {
                    this.vx -= (args[5] * 2);
                    this.scaleX = -1;
                    this.turnFlag = 'left'
                }
                
                // 右の衝突
                if(this.turnFlag === 'left' && map.hitTest(this.x + this.vx + 41 , this.y + this.vy + 40))
                {
                    this.vx += (args[5] * 2);
                    this.scaleX = +1;
                    this.turnFlag = 'right'
                }

                this.y += this.vy;
                this.x -= this.vx;
            });
        }
    });

    /**
     * 衝突判定用敵オブジェクト
     * @param args
     *   [0]: スプライトの横幅、縦幅
     *   [1]: スタート時のx座標
     *   [2]: スタート時のy座標
     * @param player プレイヤーオブジェクト
     * @param map マップオブジェクト
     */
    const EnemyCollision = enchant.Class.create(enchant.Sprite,
    {
        initialize: function(args, player, map)
        {
            enchant.Sprite.call(this, 32, 16);
            this.x = (player.x + args[1] + 8);
            this.y = (args[2] + 24);
            this.name = randomName();
        }
    });

    /**
     * 敵オブジェクトのnameプロパティの値をランダム生成
     */
    const randomName = () =>
    {
        let result = '';
        const materials = CONSTANT.RANDOM_NAME;

        for (let i = 0; i < CONSTANT.RANDOM_NAME_LENGTH; i++)
        {
            result += materials[Math.floor(Math.random() * materials.length)];
        }
        return result;
    }

    /**
     * 衝突判定チェック
     * @param player プレイヤーオブジェクト
     * @param enemy 敵オブジェクト
     * @return 衝突結果
     */
    const collisionJudgement = function(player, enemy)
    {
        if (!enemy) return false; 
        if (enemy.intersect(player))
        {
            if (player.y < 180)
            {
                return 1;
            }
            else
            {
                return 2;
            }
        }
        return false;
    }

    /**
     * スコアオブジェクト
     * @param args
     *   [0]: スタート時のx座標
     *   [1]: スタート時のy座標
     * @param stage ステージオブジェクト
     * @param core コアオブジェクト
     */
    const LifeLabel = enchant.Class.create(enchant.ui.LifeLabel,
    {
        initialize: function(args, stage, core)
        {
            enchant.ui.LifeLabel.call(this, args[0], args[1]);
            this.life = core.life;
            this.label.text = '';

            this.addEventListener('enterframe', function()
            {
                this.x = (Math.abs(stage.x) + args[0]);
            });
        }
    });

    /* ゲーム終了 */
    const gameEnd = () => {
        setTimeout(() => {
            location.href= '../index.html';
        }, 1000);
    }

    /**
     * コア生成
     */
    const core = new Core(window.innerWidth, window.innerHeight);
    core.fps = 15;
    core.life = 3; // 開始時のライフ

    core.preload(CONSTANT.CORE_PRELOAD); // 画像ファイルのプリロード

    core.onload = () =>
    {
        const stage = new Group();

        const map = new Map(CONSTANT.STAGE1);
        stage.addChild(map);

        const player = new Player(CONSTANT.PLAYER, map ,core);
        stage.addChild(player);

        const playerCollision = new PlayerCollision(CONSTANT.PLAYER, map ,core);
        stage.addChild(playerCollision);

        const lifeLabel = new LifeLabel(CONSTANT.LIFE_LABEL, stage, core);
        stage.addChild(lifeLabel);

        let enemies = []; // 敵の配列
        let enemiesCollistion = []; // 衝突判定用の配列
        let enemy = null;
        let enemyCollision = null;

        /**
         * coreオブジェクトのタッチイベント
         */
        core.rootScene.addEventListener('touchstart', function()
        {
            if (!player.isJump) {
                player.jump(); // 画面タッチでジャンプ
            }
        });

        /**
         * coreオブジェクトの毎フレームイベント
         */
        core.rootScene.addEventListener('enterframe', function(e)
        {
            // 衝突判定用スプライトの追従
            playerCollision.x = player.x + 16;
            playerCollision.y = player.y + 11;

            // 画面のスクロール
            var x = Math.min((core.width - player.width) / 2 - player.x, 0); // 画面スクロール量

            // 敵生成
            if (Math.floor(Math.random() * 500 < 5) && enemies.length < 5)
            {
                enemy = new Enemy(CONSTANT.ENEMY, player, map);
                enemyCollision = new EnemyCollision(CONSTANT.ENEMY, player, map);
                enemies.push(enemy);
                enemiesCollistion.push(enemyCollision);
                stage.addChild(enemies[(enemies.length - 1)]);
                stage.addChild(enemiesCollistion[(enemiesCollistion.length - 1)]);
            }

            for (let i = 0; i < enemies.length; i++)
            {
                // 衝突判定用スプライトの追従
                enemiesCollistion[i].x = enemies[i].x + 8;
                enemiesCollistion[i].y = enemies[i].y + 24;

                if (enemies[i].x < Math.abs(x) || collisionJudgement(playerCollision, enemiesCollistion[i]))
                {
                    if (collisionJudgement(playerCollision, enemiesCollistion[i]) === 2) 
                    {
                        player.blink(10, lifeLabel);
                    }

                    stage.removeChild(enemies[i]);　// 敵の落下判定
                    stage.removeChild(enemiesCollistion[i]);　// 敵の落下判定
                    enemies.splice(i, 1);
                    enemiesCollistion.splice(i, 1);
                }
            }

            if (player.y >= map.height || lifeLabel.life < 1 || Math.abs(x) >= map.width) {
                gameEnd();
            }
            stage.x = x;
        });

        core.rootScene.addChild(stage);
    }

    core.start();
}