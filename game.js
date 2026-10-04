/**
 * ============================================================================
 * CYBER HOOPS 2D - CORE GAME ENGINE
 * Senior Game Developer Architecture:
 * - Procedural Audio (Web Audio API)
 * - Verlet / Rigid 2D Basketball Physics & Interactive Net
 * - Procedural 2D Avatar Skeletal Animation
 * - Cursor Drag Aiming & Real-Time Trajectory Grid ("Kisi-Kisi Jalur Tembakan")
 * - Side-Mounted Power Meter with Overcharge Drop Penalty
 * - Roguelite Buff & Debuff Progression Engine
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
  // --------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.chargeOsc = null;
      this.chargeGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playBounce(vol = 0.5) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(vol * 0.7, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
      } catch (e) {}
    }

    playRimClang() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.26);
      } catch (e) {}
    }

    playSwish() {
      if (!this.enabled || !this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.25);
        filter.Q.value = 3.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
        noise.stop(this.ctx.currentTime + 0.26);
      } catch (e) {}
    }

    playScoreChord() {
      if (!this.enabled || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const start = this.ctx.currentTime + idx * 0.04;
          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + 0.36);
        });
      } catch (e) {}
    }

    playShootRelease() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.11);
      } catch (e) {}
    }

    playCancelSound() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }

    startChargeSound() {
      if (!this.enabled || !this.ctx || this.chargeOsc) return;
      try {
        this.chargeOsc = this.ctx.createOscillator();
        this.chargeGain = this.ctx.createGain();
        this.chargeOsc.type = 'sawtooth';
        this.chargeOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
        this.chargeGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.chargeOsc.connect(filter);
        filter.connect(this.chargeGain);
        this.chargeGain.connect(this.ctx.destination);
        this.chargeOsc.start();
      } catch (e) {}
    }

    updateChargeSound(powerRatio) {
      if (!this.chargeOsc || !this.ctx) return;
      try {
        const freq = 120 + powerRatio * 320;
        this.chargeOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      } catch (e) {}
    }

    stopChargeSound() {
      if (this.chargeOsc) {
        try {
          this.chargeOsc.stop();
          this.chargeOsc.disconnect();
        } catch (e) {}
        this.chargeOsc = null;
        this.chargeGain = null;
      }
    }

    playOverchargeBuzz() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      } catch (e) {}
    }

    playWhistle() {
      if (!this.enabled || !this.ctx) return;
      try {
        [2400, 2460].forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.42);
        });
      } catch (e) {}
    }

    playBuzzer() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.72);
      } catch (e) {}
    }
  }

  // --------------------------------------------------------------------------
  // 2. ROGUELITE BUFF & DEBUFF DATABASE
  // --------------------------------------------------------------------------
  const BUFF_POOL = [
    {
      id: 'GOLDEN_BALL',
      title: 'Golden Score',
      icon: '🌟',
      desc: 'Setiap bola masuk menghasilkan poin 2x lipat!',
    },
    {
      id: 'LASER_AIM',
      title: 'Laser Grid',
      icon: '🎯',
      desc: 'Kisi-kisi jalur tembakan memanjang penuh hingga ke dalam ring.',
    },
    {
      id: 'BIG_HOOP',
      title: 'Expanded Rim',
      icon: '🏀',
      desc: 'Diameter ring basket membesar 35%, lebih mudah masuk!',
    },
    {
      id: 'TIME_WARP',
      title: 'Time Warp',
      icon: '⏱️',
      desc: '+15 Detik ditambahkan ke sisa shot clock.',
    },
    {
      id: 'STEADY_AIM',
      title: 'Steady Aim',
      icon: '⚡',
      desc: 'Bidik kursor menjadi sangat stabil dengan panduan kisi-kisi ekstra presisi.',
    },
    {
      id: 'POWER_LOCK',
      title: 'Power Guard',
      icon: '🛡️',
      desc: 'Batas overcharge diperlonggar hingga 96% sweet spot.',
    },
    {
      id: 'MAGNET_RIM',
      title: 'Rim Magnet',
      icon: '🧲',
      desc: 'Gravitasi magnetik halus menarik bola dekat bibir ring.',
    }
  ];

  const DEBUFF_POOL = [
    {
      id: 'CROSSWIND',
      title: 'Crosswind',
      icon: '💨',
      desc: 'Embusan angin horizontal meniup lintasan bola.',
    },
    {
      id: 'MOVING_HOOP',
      title: 'Moving Hoop',
      icon: '🔀',
      desc: 'Ring basket bergerak naik-turun secara dinamis!',
    },
    {
      id: 'WOBBLY_AIM',
      title: 'Jittery Hands',
      icon: '📳',
      desc: 'Garis bidikan kursor sedikit bergoyang saat membidik.',
    },
    {
      id: 'HEAVY_BALL',
      title: 'Lead Ball',
      icon: '🏋️',
      desc: 'Gravitasi bola bertambah 35%, butuh tenaga ekstra.',
    },
    {
      id: 'MICRO_RIM',
      title: 'Micro Rim',
      icon: '🤏',
      desc: 'Lebar bibir ring basket mengecil 25%.',
    },
    {
      id: 'FAST_CLOCK',
      title: 'Speed Clock',
      icon: '⏳',
      desc: 'Waktu ronde berkurang 25% lebih cepat.',
    },
    {
      id: 'FOGGY_COURT',
      title: 'Foggy Court',
      icon: '🌫️',
      desc: 'Kabut malam lapangan menyamarkan jarak pandang.',
    }
  ];

  // --------------------------------------------------------------------------
  // 3. BASKETBALL NET SIMULATION (Verlet Rope Physics)
  // --------------------------------------------------------------------------
  class InteractiveNet {
    constructor(leftRimX, rightRimX, rimY) {
      this.nodes = [];
      this.springs = [];
      this.rows = 5;
      this.cols = 7;
      this.rebuild(leftRimX, rightRimX, rimY);
    }

    rebuild(leftX, rightX, rimY) {
      this.nodes = [];
      this.springs = [];
      const width = rightX - leftX;
      const height = 65;

      for (let r = 0; r <= this.rows; r++) {
        const rowNodes = [];
        const tY = r / this.rows;
        const y = rimY + tY * height;
        const taper = 1.0 - tY * 0.35;
        const currentW = width * taper;
        const currentLeft = (leftX + rightX) / 2 - currentW / 2;

        for (let c = 0; c <= this.cols; c++) {
          const tX = c / this.cols;
          const x = currentLeft + tX * currentW;
          const isPinned = r === 0;
          rowNodes.push({
            x,
            y,
            oldX: x,
            oldY: y,
            pinned: isPinned,
            baseX: x,
            baseY: y
          });
        }
        this.nodes.push(rowNodes);
      }
    }

    update(rimLeftX, rimRightX, rimY, ball) {
      const topRow = this.nodes[0];
      const width = rimRightX - rimLeftX;
      for (let c = 0; c <= this.cols; c++) {
        topRow[c].x = rimLeftX + (c / this.cols) * width;
        topRow[c].y = rimY;
        topRow[c].oldX = topRow[c].x;
        topRow[c].oldY = topRow[c].y;
      }

      const damping = 0.96;
      const gravity = 0.2;

      for (let r = 1; r <= this.rows; r++) {
        for (let c = 0; c <= this.cols; c++) {
          const n = this.nodes[r][c];
          const vx = (n.x - n.oldX) * damping;
          const vy = (n.y - n.oldY) * damping;
          n.oldX = n.x;
          n.oldY = n.y;
          n.x += vx;
          n.y += vy + gravity;

          if (ball && ball.inAir) {
            const dx = n.x - ball.x;
            const dy = n.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + 6 && dist > 0) {
              const push = (ball.radius + 6 - dist);
              n.x += (dx / dist) * push * 0.8;
              n.y += (dy / dist) * push * 0.8;
              ball.vx *= 0.985;
              ball.vy *= 0.985;
            }
          }
        }
      }

      for (let iter = 0; iter < 3; iter++) {
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c <= this.cols; c++) {
            this.constrain(this.nodes[r][c], this.nodes[r + 1][c], 13);
          }
        }
        for (let r = 1; r <= this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            this.constrain(this.nodes[r][c], this.nodes[r][c + 1], width / this.cols);
          }
        }
      }
    }

    constrain(p1, p2, targetDist) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const diff = (dist - targetDist) / dist;
      if (!p1.pinned && !p2.pinned) {
        p1.x += dx * 0.5 * diff;
        p1.y += dy * 0.5 * diff;
        p2.x -= dx * 0.5 * diff;
        p2.y -= dy * 0.5 * diff;
      } else if (!p1.pinned && p2.pinned) {
        p1.x += dx * diff;
        p1.y += dy * diff;
      } else if (p1.pinned && !p2.pinned) {
        p2.x -= dx * diff;
        p2.y -= dy * diff;
      }
    }

    render(ctx) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c <= this.cols; c++) {
          const curr = this.nodes[r][c];
          const below = this.nodes[r + 1][c];
          ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(below.x, below.y);
          ctx.stroke();

          if (c < this.cols) {
            const next = this.nodes[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(curr.x, curr.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();

            const belowNext = this.nodes[r + 1][c + 1];
            ctx.beginPath();
            ctx.moveTo(curr.x, curr.y);
            ctx.lineTo(belowNext.x, belowNext.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
  }

  // --------------------------------------------------------------------------
  // 4. MAIN GAME ENGINE CLASS
  // --------------------------------------------------------------------------
  class CyberHoopsGame {
    constructor() {
      this.canvas = document.getElementById('basketball-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.virtualW = 1280;
      this.virtualH = 720;

      this.sound = new SoundEngine();

      this.state = 'MENU';

      this.level = 1;
      this.currentScore = 0;
      this.targetScore = 12;
      this.timeLeft = 45;
      this.maxTime = 45;
      this.highScore = parseInt(localStorage.getItem('cyber_hoops_highscore') || '0', 10);
      this.comboCount = 0;
      this.totalShotsLevel = 0;
      this.swishShotsLevel = 0;

      this.activeBuffs = [];
      this.activeDebuffs = [];

      this.windForce = 0;
      this.groundY = 640;

      this.hoop = {
        baseX: 1040,
        baseY: 360,
        x: 1040,
        y: 360,
        width: 76,
        boardX: 1116,
        boardTop: 240,
        boardBottom: 420,
        rimRadius: 4.5,
        swayAngle: 0,
        swaySpeed: 0.04,
        swayAmp: 0
      };

      this.net = new InteractiveNet(this.hoop.x, this.hoop.x + this.hoop.width, this.hoop.y);

      this.player = {
        x: 230,
        y: this.groundY,
        dribbleTimer: 0,
        crouch: 0,
        jumpY: 0,
        jumpVy: 0,
        isJumping: false,
        armAngle: 0,
        holdingBall: true,
        shootCooldown: 0,
        celebrationTimer: 0
      };

      this.ball = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 14,
        rotation: 0,
        vRot: 0,
        inAir: false,
        scored: false,
        passedRimPlane: false,
        hitRim: false,
        hitBackboard: false,
        trail: [],
        deadTimer: 0
      };

      // Cursor Aiming & Drag Controls
      this.mouseCharging = false;
      this.chargeStartTime = 0;
      this.rawPower = 0;            // 0.0 to 1.0
      this.isPowerHolding = false;  // Menandakan status diam sejenak di 100%
      this.powerHoldProgress = 0;   // 0.0 sampai 1.0 selama hold 1 detik
      this.cursor = { x: 700, y: 320 };
      this.dragStart = { x: 230, y: 535 };
      this.aimAngle = (52 * Math.PI) / 180; // Default aim angle ~52 deg
      this.aimDistanceRatio = 1.0;
      this.wobbleTime = 0;

      this.particles = [];
      this.fogParticles = [];
      this.initBackgroundAtmosphere();

      this.bindElements();
      this.bindEvents();

      this.lastTimestamp = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindElements() {
      this.el = {
        levelDisplay: document.getElementById('level-display'),
        targetScoreDisplay: document.getElementById('target-score-display'),
        currentScoreDisplay: document.getElementById('current-score-display'),
        comboBadge: document.getElementById('combo-badge'),
        timerDisplay: document.getElementById('timer-display'),
        activeBuffs: document.getElementById('active-buffs'),
        activeDebuffs: document.getElementById('active-debuffs'),
        windIndicator: document.getElementById('wind-indicator'),
        windArrow: document.getElementById('wind-arrow'),
        windSpeed: document.getElementById('wind-speed'),

        floatFeedback: document.getElementById('float-feedback'),

        modalStart: document.getElementById('modal-start'),
        modalLevelComplete: document.getElementById('modal-level-complete'),
        modalGameOver: document.getElementById('modal-game-over'),
        modalHelp: document.getElementById('modal-help'),

        btnStartGame: document.getElementById('btn-start-game'),
        btnNextLevel: document.getElementById('btn-next-level'),
        btnRestartGame: document.getElementById('btn-restart-game'),
        btnAudioToggle: document.getElementById('audio-toggle-btn'),
        soundIconOn: document.getElementById('sound-icon-on'),
        soundIconOff: document.getElementById('sound-icon-off'),
        btnHelpToggle: document.getElementById('help-toggle-btn'),
        btnCloseHelp: document.getElementById('btn-close-help'),

        levelClearScore: document.getElementById('level-clear-score'),
        levelClearTime: document.getElementById('level-clear-time'),
        levelClearAcc: document.getElementById('level-clear-acc'),
        newBuffContainer: document.getElementById('new-buff-container'),
        newDebuffContainer: document.getElementById('new-debuff-container'),
        nextLevelTarget: document.getElementById('next-level-target'),
        gameoverScore: document.getElementById('gameover-score'),
        gameoverLevel: document.getElementById('gameover-level'),
        gameoverHighscore: document.getElementById('gameover-highscore')
      };
    }

    getCanvasCoords(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.virtualW / rect.width;
      const scaleY = this.virtualH / rect.height;
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    bindEvents() {
      // Audio Toggle
      this.el.btnAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.init();
        this.sound.enabled = !this.sound.enabled;
        this.el.soundIconOn.classList.toggle('hidden', !this.sound.enabled);
        this.el.soundIconOff.classList.toggle('hidden', this.sound.enabled);
      });

      // Help Modal
      this.el.btnHelpToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.init();
        this.el.modalHelp.classList.add('active');
      });
      this.el.btnCloseHelp.addEventListener('click', () => {
        this.el.modalHelp.classList.remove('active');
      });

      // Buttons
      this.el.btnStartGame.addEventListener('click', () => {
        this.sound.init();
        this.sound.playWhistle();
        this.el.modalStart.classList.remove('active');
        this.startLevel(1);
      });

      this.el.btnNextLevel.addEventListener('click', () => {
        this.sound.init();
        this.sound.playWhistle();
        this.el.modalLevelComplete.classList.remove('active');
        this.startLevel(this.level + 1);
      });

      this.el.btnRestartGame.addEventListener('click', () => {
        this.sound.init();
        this.sound.playWhistle();
        this.el.modalGameOver.classList.remove('active');
        this.startLevel(1);
      });

      // Mouse & Drag Aiming Events
      this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      window.addEventListener('mouseup', (e) => this.handleMouseUp(e));

      // Touch events
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleMouseDown(e);
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        this.handleMouseMove(e);
      }, { passive: false });
      window.addEventListener('touchend', (e) => {
        this.handleMouseUp(e);
      });

      // Spacebar alternative & Shift key to Cancel Shot
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          if (this.mouseCharging) {
            this.cancelShot();
          }
        }
        if (e.code === 'Space' && !e.repeat && this.state === 'PLAYING') {
          e.preventDefault();
          this.handleMouseDown({ clientX: this.cursor.x, clientY: this.cursor.y });
        }
      });
      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && this.state === 'PLAYING') {
          e.preventDefault();
          this.handleMouseUp(e);
        }
      });
    }

    // ------------------------------------------------------------------------
    // CURSOR DRAG AIMING & POWER CHARGE
    // ------------------------------------------------------------------------
    handleMouseDown(e) {
      if (this.state !== 'PLAYING') return;
      if (!this.player.holdingBall || this.ball.inAir || this.player.shootCooldown > 0) return;

      this.sound.init();
      const coords = this.getCanvasCoords(e);
      this.cursor = coords;
      this.dragStart = coords;
      this.mouseCharging = true;
      this.chargeStartTime = performance.now();
      this.rawPower = 0;
      this.isPowerHolding = false;
      this.powerHoldProgress = 0;
      this.sound.startChargeSound();

      this.updateAimAngle();
    }

    handleMouseMove(e) {
      if (this.state !== 'PLAYING') return;
      const coords = this.getCanvasCoords(e);
      this.cursor = coords;
      if (this.player.holdingBall) {
        this.updateAimAngle();
      }
    }

    handleMouseUp(e) {
      if (!this.mouseCharging) return;

      // Fitur Cancel Shot: jika Shift ditekan / ditahan saat melepas klik
      if (e && e.shiftKey) {
        this.cancelShot();
        return;
      }

      this.mouseCharging = false;
      this.isPowerHolding = false;
      this.powerHoldProgress = 0;
      this.sound.stopChargeSound();

      if (this.state !== 'PLAYING' || !this.player.holdingBall) {
        this.rawPower = 0;
        return;
      }

      this.executeShot();
    }

    cancelShot() {
      if (!this.mouseCharging) return;
      this.mouseCharging = false;
      this.isPowerHolding = false;
      this.powerHoldProgress = 0;
      this.rawPower = 0;
      this.player.crouch = 0;
      this.sound.stopChargeSound();
      this.sound.playCancelSound();
      this.triggerFloatNotification('BATAL TEMBAK!', false, 'cancelled');
    }

    updateAimAngle() {
      const hand = this.getPlayerHandPos();
      const dx = this.cursor.x - hand.x;
      const dy = -(this.cursor.y - hand.y); // Canvas Y is inverted

      let angle = Math.atan2(dy, dx);

      // Clamp angle safely between 16 deg and 82 deg
      const minAngle = (16 * Math.PI) / 180;
      const maxAngle = (82 * Math.PI) / 180;
      angle = Math.max(minAngle, Math.min(maxAngle, angle));

      // Jittery Debuff wobble effect
      if (this.hasDebuff('WOBBLY_AIM')) {
        angle += Math.sin(this.wobbleTime * 8) * 0.045;
      }

      this.aimAngle = angle;
    }

    executeShot() {
      const hasPowerLock = this.hasBuff('POWER_LOCK');
      const overchargeLimit = hasPowerLock ? 0.96 : 0.85;

      let effectivePowerRatio = 0;

      if (this.rawPower > overchargeLimit) {
        // OVERCHARGE PENALTY:
        // Strength drops drastically down to 0.38 - 0.45 (weak airball shot)
        effectivePowerRatio = 0.40 - (this.rawPower - overchargeLimit) * 0.4;
        this.triggerFloatNotification('OVERCHARGED! MELEMAH', true);
        this.sound.playOverchargeBuzz();
      } else if (this.rawPower >= 0.68 && this.rawPower <= overchargeLimit) {
        // SWEET SPOT:
        effectivePowerRatio = 0.96 + (this.rawPower - 0.68) * 0.22;
        this.triggerFloatNotification('PERFECT POWER!', false);
      } else {
        // Undercharged proportional
        effectivePowerRatio = Math.max(0.15, this.rawPower * 1.25);
      }

      // Base launch velocity calibrated for 1280x720 court
      const baseVelocity = 23.5;
      let totalSpeed = baseVelocity * effectivePowerRatio;

      if (this.hasDebuff('HEAVY_BALL')) {
        totalSpeed *= 0.88;
      }

      const vx = Math.cos(this.aimAngle) * totalSpeed;
      const vy = -Math.sin(this.aimAngle) * totalSpeed;

      // Jump-shot animation
      this.player.isJumping = true;
      this.player.jumpVy = -7;
      this.player.holdingBall = false;
      this.player.shootCooldown = 25;

      const handPos = this.getPlayerHandPos();
      this.ball.x = handPos.x;
      this.ball.y = handPos.y;
      this.ball.vx = vx;
      this.ball.vy = vy;
      this.ball.inAir = true;
      this.ball.scored = false;
      this.ball.passedRimPlane = false;
      this.ball.hitRim = false;
      this.ball.hitBackboard = false;
      this.ball.rotation = 0;
      this.ball.vRot = -0.15;
      this.ball.trail = [];
      this.ball.deadTimer = 0;

      this.totalShotsLevel++;
      this.sound.playShootRelease();
      this.rawPower = 0;
      this.isPowerHolding = false;
      this.powerHoldProgress = 0;
    }

    triggerFloatNotification(text, isDanger = false, customClass = '') {
      this.el.floatFeedback.innerHTML = '';
      const div = document.createElement('div');
      div.className = `floating-text ${isDanger ? 'overcharge' : ''} ${customClass}`.trim();
      div.textContent = text;
      this.el.floatFeedback.appendChild(div);
      setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
      }, 1200);
    }

    // ------------------------------------------------------------------------
    // LEVEL LIFECYCLE & ROGUELITE PROGRESSION
    // ------------------------------------------------------------------------
    startLevel(lvl) {
      this.level = lvl;
      this.currentScore = 0;
      this.comboCount = 0;
      this.totalShotsLevel = 0;
      this.swishShotsLevel = 0;

      this.targetScore = 12 + (lvl - 1) * 14;
      this.maxTime = Math.max(30, 48 - (lvl - 1) * 3);
      this.timeLeft = this.maxTime;

      this.rollModifiersForLevel(lvl);
      this.applyActiveModifiers();
      this.spawnBallInHands();

      this.updateHUD();
      this.state = 'PLAYING';
    }

    rollModifiersForLevel(lvl) {
      const buffCount = lvl >= 3 ? 2 : 1;

      let debuffCount = 0;
      if (lvl === 2) debuffCount = 1;
      else if (lvl === 3) debuffCount = 2;
      else if (lvl === 4) debuffCount = 3;
      else if (lvl >= 5) debuffCount = Math.min(4, lvl - 1);

      const shuffledBuffs = [...BUFF_POOL].sort(() => Math.random() - 0.5);
      this.activeBuffs = shuffledBuffs.slice(0, buffCount);

      const shuffledDebuffs = [...DEBUFF_POOL].sort(() => Math.random() - 0.5);
      this.activeDebuffs = shuffledDebuffs.slice(0, debuffCount);

      this.renderModifierBadges();
    }

    renderModifierBadges() {
      this.el.activeBuffs.innerHTML = '';
      if (this.activeBuffs.length === 0) {
        this.el.activeBuffs.innerHTML = '<span class="empty-badge">None</span>';
      } else {
        this.activeBuffs.forEach(buff => {
          const badge = document.createElement('span');
          badge.className = 'mod-badge buff-badge';
          badge.title = buff.desc;
          badge.innerHTML = `<span>${buff.icon}</span> ${buff.title}`;
          this.el.activeBuffs.appendChild(badge);
        });
      }

      this.el.activeDebuffs.innerHTML = '';
      if (this.activeDebuffs.length === 0) {
        this.el.activeDebuffs.innerHTML = '<span class="empty-badge">None</span>';
      } else {
        this.activeDebuffs.forEach(debuff => {
          const badge = document.createElement('span');
          badge.className = 'mod-badge debuff-badge';
          badge.title = debuff.desc;
          badge.innerHTML = `<span>${debuff.icon}</span> ${debuff.title}`;
          this.el.activeDebuffs.appendChild(badge);
        });
      }
    }

    applyActiveModifiers() {
      if (this.hasBuff('TIME_WARP')) {
        this.timeLeft += 15;
        this.maxTime += 15;
      }

      let hoopWidth = 76;
      if (this.hasBuff('BIG_HOOP')) hoopWidth *= 1.35;
      if (this.hasDebuff('MICRO_RIM')) hoopWidth *= 0.75;
      this.hoop.width = hoopWidth;
      this.net.rebuild(this.hoop.x, this.hoop.x + this.hoop.width, this.hoop.y);

      if (this.hasDebuff('CROSSWIND')) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.windForce = dir * (2.0 + Math.random() * 2.5);
        this.el.windIndicator.classList.remove('hidden');
        this.el.windArrow.style.transform = dir > 0 ? 'rotate(0deg)' : 'rotate(180deg)';
        this.el.windSpeed.textContent = `${Math.abs(this.windForce).toFixed(1)} m/s`;
      } else {
        this.windForce = 0;
        this.el.windIndicator.classList.add('hidden');
      }

      if (this.hasDebuff('MOVING_HOOP')) {
        this.hoop.swayAmp = 45;
        this.hoop.swaySpeed = 0.045;
      } else {
        this.hoop.swayAmp = 0;
        this.hoop.y = this.hoop.baseY;
      }
    }

    hasBuff(id) {
      return this.activeBuffs.some(b => b.id === id);
    }

    hasDebuff(id) {
      return this.activeDebuffs.some(d => d.id === id);
    }

    spawnBallInHands() {
      this.player.holdingBall = true;
      this.player.isJumping = false;
      this.player.jumpY = 0;
      this.player.jumpVy = 0;
      this.ball.inAir = false;
      this.ball.scored = false;
      this.ball.passedRimPlane = false;
      this.ball.hitRim = false;
      this.ball.hitBackboard = false;
      this.ball.trail = [];
      const hand = this.getPlayerHandPos();
      this.ball.x = hand.x;
      this.ball.y = hand.y;
      this.ball.vx = 0;
      this.ball.vy = 0;
    }

    getPlayerHandPos() {
      const crouchOffset = this.player.crouch * 18;
      const jumpOffset = this.player.jumpY;
      return {
        x: this.player.x + 36,
        y: this.groundY - 105 + crouchOffset + jumpOffset
      };
    }

    handleScoreMade(isSwish) {
      this.ball.scored = true;
      let points = isSwish ? 3 : 2;

      if (this.hasBuff('GOLDEN_BALL')) {
        points *= 2;
      }

      this.comboCount++;
      if (this.comboCount > 1) {
        points += (this.comboCount - 1);
        this.el.comboBadge.textContent = `x${this.comboCount} COMBO!`;
        this.el.comboBadge.classList.remove('hidden');
      }

      this.currentScore += points;
      if (this.currentScore > this.highScore) {
        this.highScore = this.currentScore;
        localStorage.setItem('cyber_hoops_highscore', this.highScore.toString());
      }

      if (isSwish) {
        this.swishShotsLevel++;
        this.sound.playSwish();
        this.sound.playScoreChord();
        this.triggerFloatNotification(`SWISH! +${points}`, false);
        this.createSwishExplosion(this.hoop.x + this.hoop.width / 2, this.hoop.y + 20);
      } else {
        this.sound.playScoreChord();
        this.triggerFloatNotification(`BASKET! +${points}`, false);
      }

      this.player.celebrationTimer = 40;
      this.updateHUD();

      if (this.currentScore >= this.targetScore) {
        setTimeout(() => this.triggerLevelClear(), 700);
      }
    }

    triggerLevelClear() {
      if (this.state !== 'PLAYING') return;
      this.state = 'LEVEL_COMPLETE';
      this.sound.playWhistle();

      this.el.levelClearScore.textContent = this.currentScore.toString();
      this.el.levelClearTime.textContent = `${Math.ceil(this.timeLeft)}s`;
      const acc = this.totalShotsLevel > 0 
        ? Math.round((this.swishShotsLevel / this.totalShotsLevel) * 100) 
        : 100;
      this.el.levelClearAcc.textContent = `${acc}%`;

      const nextTarget = 12 + this.level * 14;
      this.el.nextLevelTarget.textContent = `${nextTarget} POIN`;

      const sampleBuff = BUFF_POOL[Math.floor(Math.random() * BUFF_POOL.length)];
      const sampleDebuff = DEBUFF_POOL[Math.floor(Math.random() * DEBUFF_POOL.length)];

      this.el.newBuffContainer.innerHTML = `
        <div class="mod-title"><span>${sampleBuff.icon}</span> ${sampleBuff.title}</div>
        <div class="mod-desc">${sampleBuff.desc}</div>
      `;
      this.el.newDebuffContainer.innerHTML = `
        <div class="mod-title"><span>${sampleDebuff.icon}</span> ${sampleDebuff.title}</div>
        <div class="mod-desc">${sampleDebuff.desc}</div>
      `;

      this.el.modalLevelComplete.classList.add('active');
    }

    triggerGameOver() {
      if (this.state !== 'PLAYING') return;
      this.state = 'GAMEOVER';
      this.sound.playBuzzer();

      this.el.gameoverScore.textContent = this.currentScore.toString();
      this.el.gameoverLevel.textContent = this.level.toString().padStart(2, '0');
      this.el.gameoverHighscore.textContent = this.highScore.toString();

      this.el.modalGameOver.classList.add('active');
    }

    updateHUD() {
      this.el.levelDisplay.textContent = this.level.toString().padStart(2, '0');
      this.el.targetScoreDisplay.textContent = this.targetScore.toString();
      this.el.currentScoreDisplay.textContent = this.currentScore.toString();
      this.el.timerDisplay.innerHTML = `${Math.ceil(this.timeLeft)}<small>s</small>`;
    }

    // ------------------------------------------------------------------------
    // MAIN LOOP & PHYSICS TICK
    // ------------------------------------------------------------------------
    gameLoop(timestamp) {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
      this.wobbleTime += dt;

      // Power Charging (dengan jeda diam 1 detik saat mencapai 100%, lalu auto-looping ke 0%)
      if (this.mouseCharging && this.state === 'PLAYING') {
        const elapsed = performance.now() - this.chargeStartTime;
        const chargeDuration = 1150; // Durasi pengisian dari 0% ke 100% (ms)
        const holdDuration = 1000;   // Diam sebentar di 100% selama 1 detik (ms)
        const cycleTotal = chargeDuration + holdDuration;
        const cycleTime = elapsed % cycleTotal;

        if (cycleTime < chargeDuration) {
          this.rawPower = cycleTime / chargeDuration;
          this.isPowerHolding = false;
          this.powerHoldProgress = 0;
        } else {
          this.rawPower = 1.0;
          this.isPowerHolding = true;
          this.powerHoldProgress = (cycleTime - chargeDuration) / holdDuration;
        }

        this.player.crouch = this.rawPower;
        this.sound.updateChargeSound(this.rawPower);
      } else {
        this.isPowerHolding = false;
        this.powerHoldProgress = 0;
        this.player.crouch = 0;
      }

      // Timer
      if (this.state === 'PLAYING') {
        let clockSpeed = 1.0;
        if (this.hasDebuff('FAST_CLOCK')) clockSpeed = 1.25;

        this.timeLeft -= dt * clockSpeed;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.updateHUD();
          this.triggerGameOver();
          return;
        }
        this.updateHUD();
      }

      // Moving Hoop
      if (this.hoop.swayAmp > 0) {
        this.hoop.swayAngle += this.hoop.swaySpeed;
        this.hoop.y = this.hoop.baseY + Math.sin(this.hoop.swayAngle) * this.hoop.swayAmp;
        this.hoop.boardTop = this.hoop.y - 120;
        this.hoop.boardBottom = this.hoop.y + 60;
      }

      this.updatePlayer(dt);
      this.updateBall(dt);
      this.net.update(this.hoop.x, this.hoop.x + this.hoop.width, this.hoop.y, this.ball);
      this.updateParticles(dt);
    }

    updatePlayer(dt) {
      if (this.player.shootCooldown > 0) {
        this.player.shootCooldown--;
      }
      if (this.player.celebrationTimer > 0) {
        this.player.celebrationTimer--;
      }

      if (this.player.isJumping) {
        this.player.jumpY += this.player.jumpVy;
        this.player.jumpVy += 0.45;
        if (this.player.jumpY >= 0) {
          this.player.jumpY = 0;
          this.player.jumpVy = 0;
          this.player.isJumping = false;
        }
      }

      if (this.player.holdingBall && !this.mouseCharging) {
        this.player.crouch = 0;
        this.player.dribbleTimer += dt * 7;
      }
    }

    updateBall(dt) {
      if (!this.ball.inAir) return;

      this.ball.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 1.0 });
      if (this.ball.trail.length > 18) this.ball.trail.shift();
      this.ball.trail.forEach(t => t.alpha -= 0.04);

      let g = 0.38;
      if (this.hasDebuff('HEAVY_BALL')) g = 0.52;
      this.ball.vy += g;

      if (this.windForce !== 0) {
        this.ball.vx += this.windForce * 0.025;
      }

      if (this.hasBuff('MAGNET_RIM') && !this.ball.scored) {
        const rimCenterX = this.hoop.x + this.hoop.width / 2;
        const rimCenterY = this.hoop.y;
        const dx = rimCenterX - this.ball.x;
        const dy = rimCenterY - this.ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && this.ball.y < rimCenterY) {
          this.ball.vx += (dx / dist) * 0.22;
          this.ball.vy += (dy / dist) * 0.18;
        }
      }

      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.rotation += this.ball.vRot;

      this.checkHoopCollisions();
      this.checkBasketScore();

      if (this.ball.y + this.ball.radius >= this.groundY) {
        this.ball.y = this.groundY - this.ball.radius;
        this.ball.vy = -this.ball.vy * 0.65;
        this.ball.vx *= 0.85;
        this.ball.vRot = this.ball.vx * 0.04;
        if (Math.abs(this.ball.vy) > 1.2) {
          this.sound.playBounce(Math.min(1, Math.abs(this.ball.vy) / 6));
          this.createFloorSparks(this.ball.x, this.groundY);
        }
      }

      const isOutOfBounds = (this.ball.x > this.virtualW + 60 || this.ball.x < -60);
      const isResting = (Math.abs(this.ball.vy) < 0.3 && Math.abs(this.ball.vx) < 0.3 && this.ball.y >= this.groundY - this.ball.radius - 2);

      if (isOutOfBounds || isResting || this.ball.scored) {
        this.ball.deadTimer++;
        const resetThreshold = this.ball.scored ? 40 : 55;
        if (this.ball.deadTimer > resetThreshold) {
          if (!this.ball.scored && this.comboCount > 0) {
            this.comboCount = 0;
            this.el.comboBadge.classList.add('hidden');
          }
          this.spawnBallInHands();
        }
      }
    }

    checkHoopCollisions() {
      const bx = this.hoop.boardX;
      const bTop = this.hoop.boardTop;
      const bBottom = this.hoop.boardBottom;

      if (this.ball.y >= bTop && this.ball.y <= bBottom) {
        if (this.ball.x + this.ball.radius >= bx && this.ball.x - this.ball.radius <= bx + 12) {
          this.ball.x = bx - this.ball.radius;
          this.ball.vx = -Math.abs(this.ball.vx) * 0.68;
          this.ball.hitBackboard = true;
          this.sound.playRimClang();
          this.createSparks(bx, this.ball.y);
        }
      }

      const leftLip = { x: this.hoop.x, y: this.hoop.y, r: this.hoop.rimRadius };
      this.resolveCircleCollision(leftLip);

      const rightLip = { x: this.hoop.x + this.hoop.width, y: this.hoop.y, r: this.hoop.rimRadius };
      this.resolveCircleCollision(rightLip);
    }

    resolveCircleCollision(lip) {
      const dx = this.ball.x - lip.x;
      const dy = this.ball.y - lip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = this.ball.radius + lip.r;

      if (dist < minDist && dist > 0.0001) {
        const nx = dx / dist;
        const ny = dy / dist;

        this.ball.x = lip.x + nx * minDist;
        this.ball.y = lip.y + ny * minDist;

        const dot = this.ball.vx * nx + this.ball.vy * ny;
        if (dot < 0) {
          const restitution = 0.58;
          this.ball.vx = (this.ball.vx - (1 + restitution) * dot * nx);
          this.ball.vy = (this.ball.vy - (1 + restitution) * dot * ny);
          this.ball.hitRim = true;
          this.sound.playRimClang();
          this.createSparks(lip.x, lip.y);
        }
      }
    }

    checkBasketScore() {
      if (this.ball.scored) return;

      const rimY = this.hoop.y;
      const rimLeft = this.hoop.x + 5;
      const rimRight = this.hoop.x + this.hoop.width - 5;

      const isWithinX = (this.ball.x >= rimLeft && this.ball.x <= rimRight);
      const isMovingDown = this.ball.vy > 0;

      if (isWithinX && isMovingDown) {
        if (!this.ball.passedRimPlane && this.ball.y <= rimY + 6 && this.ball.y >= rimY - 14) {
          this.ball.passedRimPlane = true;
        } else if (this.ball.passedRimPlane && this.ball.y > rimY + 8) {
          const isSwish = !this.ball.hitRim && !this.ball.hitBackboard;
          this.handleScoreMade(isSwish);
        }
      }
    }

    // ------------------------------------------------------------------------
    // PARTICLES
    // ------------------------------------------------------------------------
    initBackgroundAtmosphere() {
      for (let i = 0; i < 30; i++) {
        this.fogParticles.push({
          x: Math.random() * this.virtualW,
          y: Math.random() * (this.groundY - 100),
          radius: 1 + Math.random() * 2,
          alpha: 0.15 + Math.random() * 0.25,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.1 - Math.random() * 0.2
        });
      }
    }

    updateParticles(dt) {
      this.fogParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = this.groundY - 50;
        if (p.x < 0) p.x = this.virtualW;
        if (p.x > this.virtualW) p.x = 0;
      });

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.15;
        p.alpha -= p.fade;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    createSparks(x, y) {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.2,
          radius: 1.5 + Math.random() * 1.5,
          alpha: 1.0,
          fade: 0.05,
          color: '#FFE600'
        });
      }
    }

    createFloorSparks(x, y) {
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2.5,
          gravity: 0.25,
          radius: 1.2,
          alpha: 0.8,
          fade: 0.08,
          color: '#FFE600'
        });
      }
    }

    createSwishExplosion(x, y) {
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.1,
          radius: 2 + Math.random() * 2.5,
          alpha: 1.0,
          fade: 0.03,
          color: Math.random() > 0.3 ? '#FFE600' : '#FFFFFF'
        });
      }
    }

    // ------------------------------------------------------------------------
    // RENDERING PIPELINE
    // ------------------------------------------------------------------------
    render() {
      this.ctx.clearRect(0, 0, this.virtualW, this.virtualH);

      // 1. Court Environment
      this.renderCourtBackground();

      // 2. Trajectory Grid ("Kisi-Kisi Jalur Tembakan")
      if (this.player.holdingBall) {
        this.renderTrajectoryGrid();
      }

      // 3. Hoop (Backboard, Net, Rim)
      this.renderHoopBackboard();
      this.net.render(this.ctx);
      this.renderHoopRimFront();

      // 4. Basketball
      this.renderBall();

      // 5. 2D Avatar Character
      this.renderAvatar();

      // 6. Side Power Meter (Placed immediately to the right of avatar)
      if (this.player.holdingBall) {
        this.renderSidePowerMeter();
      }

      // 7. Ambient Foreground Particles
      this.renderParticles();
    }

    renderCourtBackground() {
      const ctx = this.ctx;

      const grad = ctx.createLinearGradient(0, 0, 0, this.virtualH);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.65, '#101726');
      grad.addColorStop(0.66, '#182033');
      grad.addColorStop(1, '#0b0f1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.virtualW, this.virtualH);

      ctx.save();
      const lightGrad = ctx.createRadialGradient(900, 100, 50, 900, 300, 500);
      lightGrad.addColorStop(0, 'rgba(255, 230, 0, 0.12)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, this.virtualW, this.virtualH);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 18, 0.6)';
      const buildings = [
        [40, 220, 80], [130, 180, 110], [250, 260, 90], [360, 210, 130],
        [510, 240, 75], [600, 190, 105], [720, 270, 85], [820, 200, 120]
      ];
      buildings.forEach(([bx, bh, bw]) => {
        ctx.fillRect(bx, this.groundY - bh, bw, bh);
        ctx.fillStyle = 'rgba(255, 230, 0, 0.15)';
        for (let wy = this.groundY - bh + 20; wy < this.groundY - 30; wy += 35) {
          ctx.fillRect(bx + 15, wy, 8, 12);
          ctx.fillRect(bx + bw - 25, wy, 8, 12);
        }
        ctx.fillStyle = 'rgba(7, 10, 18, 0.6)';
      });
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#0f1420';
      ctx.fillRect(0, this.groundY, this.virtualW, this.virtualH - this.groundY);

      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255, 230, 0, 0.45)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.virtualW, this.groundY);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(this.hoop.x, this.groundY, 440, 75, 0, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      ctx.strokeRect(this.hoop.x - 140, this.groundY, 260, 4);

      ctx.beginPath();
      ctx.moveTo(this.hoop.x - 220, this.groundY);
      ctx.lineTo(this.hoop.x - 220, this.groundY + 35);
      ctx.stroke();

      ctx.restore();
    }

    renderHoopBackboard() {
      const ctx = this.ctx;
      const h = this.hoop;

      ctx.save();
      ctx.strokeStyle = '#1b2333';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(h.boardX + 10, h.y);
      ctx.lineTo(this.virtualW - 60, this.groundY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(20, 27, 40, 0.7)';
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(255, 230, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.strokeRect(h.boardX, h.boardTop, 12, h.boardBottom - h.boardTop);
      ctx.fillRect(h.boardX, h.boardTop, 12, h.boardBottom - h.boardTop);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(h.boardX, h.y - 45, 8, 48);

      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(h.boardX, h.y);
      ctx.lineTo(h.x + h.width, h.y);
      ctx.stroke();

      ctx.restore();
    }

    renderHoopRimFront() {
      const ctx = this.ctx;
      const h = this.hoop;

      ctx.save();
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(255, 230, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + h.width, h.y);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.rimRadius, 0, Math.PI * 2);
      ctx.arc(h.x + h.width, h.y, h.rimRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // KISI-KISI JALUR TEMBAKAN (TRAJECTORY GRID)
    // ------------------------------------------------------------------------
    renderTrajectoryGrid() {
      const ctx = this.ctx;
      const hand = this.getPlayerHandPos();
      const angle = this.aimAngle;

      const hasPowerLock = this.hasBuff('POWER_LOCK');
      const overchargeLimit = hasPowerLock ? 0.96 : 0.85;

      let estPowerRatio = 0.78; // Default preview ratio when not holding
      let isOvercharged = false;
      let isSweetSpot = false;

      if (this.mouseCharging) {
        if (this.rawPower > overchargeLimit) {
          isOvercharged = true;
          estPowerRatio = 0.40 - (this.rawPower - overchargeLimit) * 0.4;
        } else if (this.rawPower >= 0.68) {
          isSweetSpot = true;
          estPowerRatio = 0.96 + (this.rawPower - 0.68) * 0.22;
        } else {
          estPowerRatio = Math.max(0.18, this.rawPower * 1.25);
        }
      }

      let speed = 23.5 * estPowerRatio;
      if (this.hasDebuff('HEAVY_BALL')) speed *= 0.88;

      let vx = Math.cos(angle) * speed;
      let vy = -Math.sin(angle) * speed;
      let g = 0.38;
      if (this.hasDebuff('HEAVY_BALL')) g = 0.52;

      // Color scheme based on state
      let mainColor = '#FFE600';
      let glowColor = 'rgba(255, 230, 0, 0.6)';
      if (isOvercharged) {
        mainColor = '#ff4757';
        glowColor = 'rgba(255, 71, 87, 0.7)';
      } else if (isSweetSpot) {
        mainColor = '#FFF01F';
        glowColor = 'rgba(255, 240, 31, 0.9)';
      }

      // Max step count: Full arc if LASER_AIM buff, else 45 steps
      const maxSteps = this.hasBuff('LASER_AIM') ? 58 : 42;
      const points = [];
      let curX = hand.x;
      let curY = hand.y;

      let apex = { x: curX, y: curY, index: 0 };

      for (let s = 0; s < maxSteps; s++) {
        if (this.windForce !== 0) vx += this.windForce * 0.025;
        vy += g;
        curX += vx;
        curY += vy;

        points.push({ x: curX, y: curY, vx, vy });

        if (curY < apex.y) {
          apex = { x: curX, y: curY, index: s };
        }

        if (curY >= this.groundY) break;
      }

      if (points.length < 2) return;

      ctx.save();

      // 1. Draw Parabolic Center Spine Line
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = isSweetSpot ? 3.0 : 2.0;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isSweetSpot ? 16 : 8;
      ctx.setLineDash([6, 6]);

      ctx.beginPath();
      ctx.moveTo(hand.x, hand.y);
      for (let i = 0; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 2. Draw "Kisi-Kisi" (Perpendicular Grid Rulers along the arc)
      ctx.lineWidth = 1.5;
      for (let i = 2; i < points.length; i += 3) {
        const pt = points[i];
        // Calculate tangent & normal vector
        const mag = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy) || 1;
        const nx = -pt.vy / mag;
        const ny = pt.vx / mag;
        const tickLen = 7;

        // Draw cross-tick (kisi-kisi line)
        ctx.strokeStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(pt.x - nx * tickLen, pt.y - ny * tickLen);
        ctx.lineTo(pt.x + nx * tickLen, pt.y + ny * tickLen);
        ctx.stroke();

        // Node dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Vertical Floor Drop Lines (Grid Elevation Ticks)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      [Math.floor(points.length * 0.35), Math.floor(points.length * 0.7)].forEach(idx => {
        if (points[idx] && points[idx].y < this.groundY - 10) {
          ctx.beginPath();
          ctx.moveTo(points[idx].x, points[idx].y);
          ctx.lineTo(points[idx].x, this.groundY);
          ctx.stroke();

          // Floor marker cross
          ctx.beginPath();
          ctx.moveTo(points[idx].x - 6, this.groundY);
          ctx.lineTo(points[idx].x + 6, this.groundY);
          ctx.stroke();
        }
      });
      ctx.restore();

      // 4. Apex Marker (Puncak Lintasan)
      ctx.save();
      ctx.strokeStyle = mainColor;
      ctx.fillStyle = '#0f1420';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Apex Height Label
      const heightAboveFloor = Math.round((this.groundY - apex.y) / 10);
      ctx.fillStyle = mainColor;
      ctx.font = '11px "Outfit", sans-serif';
      ctx.fillText(`▲ H: ${heightAboveFloor}m`, apex.x - 18, apex.y - 10);
      ctx.restore();

      // 5. Landing / Target Crosshair Marker
      const lastPt = points[points.length - 1];
      ctx.save();
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(lastPt.x, lastPt.y, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lastPt.x - 12, lastPt.y);
      ctx.lineTo(lastPt.x + 12, lastPt.y);
      ctx.moveTo(lastPt.x, lastPt.y - 12);
      ctx.lineTo(lastPt.x, lastPt.y + 12);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // POWER METER (PLACED DIRECTLY TO THE RIGHT OF AVATAR)
    // ------------------------------------------------------------------------
    renderSidePowerMeter() {
      const ctx = this.ctx;
      const p = this.player;

      const hasPowerLock = this.hasBuff('POWER_LOCK');
      const overchargeLimit = hasPowerLock ? 0.96 : 0.85;

      const crouch = p.crouch * 12;
      const jump = p.jumpY;

      // Position immediately to the right of avatar character
      let meterX = p.x + 68;
      let meterY = this.groundY - 170 + crouch + jump;
      const meterW = 26;
      const meterH = 145;

      // Overcharge shake
      if (this.rawPower > overchargeLimit) {
        meterX += (Math.random() - 0.5) * 4;
        meterY += (Math.random() - 0.5) * 3;
      }

      ctx.save();

      // 1. Meter Outer Container
      ctx.fillStyle = 'rgba(12, 17, 26, 0.88)';
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.roundRect(meterX, meterY, meterW, meterH, 6);
      ctx.fill();
      ctx.stroke();

      // 2. Sweet Spot Zone Bracket (Between 68% and 85%)
      const sweetBottom = meterY + meterH * (1 - 0.68);
      const sweetTop = meterY + meterH * (1 - overchargeLimit);
      const sweetHeight = sweetBottom - sweetTop;

      ctx.fillStyle = 'rgba(255, 230, 0, 0.22)';
      ctx.fillRect(meterX + 2, sweetTop, meterW - 4, sweetHeight);

      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(meterX + 2, sweetTop, meterW - 4, sweetHeight);

      // 3. Overcharge Hazard Zone (>85%)
      const overTop = meterY + 2;
      const overHeight = sweetTop - overTop;

      ctx.save();
      ctx.beginPath();
      ctx.rect(meterX + 2, overTop, meterW - 4, overHeight);
      ctx.clip();
      ctx.fillStyle = 'rgba(255, 71, 87, 0.35)';
      ctx.fillRect(meterX + 2, overTop, meterW - 4, overHeight);

      // Hazard diagonal stripes
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.7)';
      ctx.lineWidth = 2;
      for (let sx = -meterW; sx < meterW * 2; sx += 6) {
        ctx.beginPath();
        ctx.moveTo(meterX + sx, overTop);
        ctx.lineTo(meterX + sx + 12, sweetTop);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Power Level Rising Fill
      const fillHeight = (meterH - 4) * this.rawPower;
      const fillY = (meterY + meterH - 2) - fillHeight;

      if (fillHeight > 0) {
        let fillGrad = ctx.createLinearGradient(0, meterY + meterH, 0, fillY);
        if (this.rawPower > overchargeLimit) {
          fillGrad.addColorStop(0, '#ff4757');
          fillGrad.addColorStop(1, '#ff6b81');
          ctx.shadowColor = 'rgba(255, 71, 87, 0.9)';
        } else {
          fillGrad.addColorStop(0, '#ca9b00');
          fillGrad.addColorStop(0.7, '#FFE600');
          fillGrad.addColorStop(1, '#FFF01F');
          ctx.shadowColor = 'rgba(255, 230, 0, 0.75)';
        }
        ctx.shadowBlur = 10;
        ctx.fillStyle = fillGrad;

        ctx.beginPath();
        ctx.roundRect(meterX + 3, fillY, meterW - 6, fillHeight, [0, 0, 4, 4]);
        ctx.fill();
      }

      // 5. Scale Tick Marks (25%, 50%, 75%)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach(t => {
        const ty = meterY + meterH * (1 - t);
        ctx.beginPath();
        ctx.moveTo(meterX + 2, ty);
        ctx.lineTo(meterX + 7, ty);
        ctx.stroke();
      });

      // 6. Header Label & Real-Time Percentage Readout
      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PWR', meterX + meterW / 2, meterY - 14);

      const pct = Math.round(this.rawPower * 100);
      ctx.font = 'bold 13px "Bebas Neue", sans-serif';
      if (this.isPowerHolding) {
        ctx.fillStyle = Math.sin(this.wobbleTime * 14) > 0 ? '#ff4757' : '#FFE600';
      } else {
        ctx.fillStyle = '#FFE600';
      }
      ctx.fillText(`${pct}%`, meterX + meterW / 2, meterY - 3);

      // 7. Sweet Spot & Overcharge Side Labels
      ctx.textAlign = 'left';
      ctx.font = '8px "Outfit", sans-serif';

      if (this.rawPower > overchargeLimit) {
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.fillText('OVERCHARGE!', meterX + meterW + 6, overTop + 10);
        if (this.isPowerHolding) {
          ctx.fillStyle = '#FFE600';
          ctx.font = 'bold 8px "Outfit", sans-serif';
          ctx.fillText('🔄 LOOPING...', meterX + meterW + 6, overTop + 20);
        } else {
          ctx.fillText('(MELEMAH)', meterX + meterW + 6, overTop + 20);
        }
      } else if (this.rawPower >= 0.68) {
        ctx.fillStyle = '#FFF01F';
        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.fillText('PERFECT!', meterX + meterW + 6, sweetTop + sweetHeight / 2 + 3);
      } else {
        ctx.fillStyle = 'rgba(255, 230, 0, 0.7)';
        ctx.fillText('SWEET SPOT', meterX + meterW + 6, sweetTop + sweetHeight / 2 + 3);
      }

      // 8. Visual border pulse during 1-second hold
      if (this.isPowerHolding) {
        ctx.save();
        ctx.strokeStyle = Math.sin(this.wobbleTime * 16) > 0 ? '#FFE600' : '#ff4757';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 8;
        ctx.strokeRect(meterX, meterY, meterW, meterH);
        ctx.restore();
      }

      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // AVATAR & BASKETBALL RENDERING
    // ------------------------------------------------------------------------
    renderAvatar() {
      const ctx = this.ctx;
      const p = this.player;

      ctx.save();
      ctx.translate(p.x, p.y + p.jumpY);

      const crouch = p.crouch * 18;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      const shadowScale = Math.max(0.4, 1.0 - Math.abs(p.jumpY) / 160);
      ctx.beginPath();
      ctx.ellipse(15, -crouch, 36 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      let armAngle = -this.aimAngle;
      if (p.isJumping) armAngle = -1.7;
      else if (p.celebrationTimer > 0) armAngle = -2.1;
      else if (this.mouseCharging) armAngle = -this.aimAngle + p.crouch * 0.2;

      ctx.strokeStyle = '#121722';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(5, -45 + crouch);
      ctx.lineTo(0, -20 + crouch * 0.5);
      ctx.lineTo(-6, -4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(22, -45 + crouch);
      ctx.lineTo(26, -20 + crouch * 0.5);
      ctx.lineTo(32, -4);
      ctx.stroke();

      ctx.fillStyle = '#FFE600';
      ctx.fillRect(-12, -7, 16, 7);
      ctx.fillRect(26, -7, 16, 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-12, -3, 16, 3);
      ctx.fillRect(26, -3, 16, 3);

      ctx.fillStyle = '#0f1420';
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 2;
      ctx.fillRect(2, -92 + crouch, 26, 48);
      ctx.strokeRect(2, -92 + crouch, 26, 48);

      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 16px "Bebas Neue", sans-serif';
      ctx.fillText('07', 9, -60 + crouch);

      ctx.fillStyle = '#d4a373';
      ctx.beginPath();
      ctx.arc(15, -112 + crouch, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0a0d14';
      ctx.beginPath();
      ctx.arc(13, -115 + crouch, 13, Math.PI, Math.PI * 1.95);
      ctx.fill();

      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(15, -112 + crouch, 13, Math.PI * 0.9, Math.PI * 1.8);
      ctx.stroke();

      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(15, -85 + crouch);
      const armEndX = 15 + Math.cos(armAngle) * 36;
      const armEndY = -85 + crouch + Math.sin(armAngle) * 36;
      ctx.lineTo(armEndX, armEndY);
      ctx.stroke();

      ctx.restore();

      if (p.holdingBall && !this.ball.inAir) {
        let dribbleY = 0;
        if (!this.mouseCharging) {
          dribbleY = Math.abs(Math.sin(p.dribbleTimer)) * 34;
        }
        const hand = this.getPlayerHandPos();
        this.renderBasketballAt(hand.x, hand.y + dribbleY, 0);
      }
    }

    renderBall() {
      if (!this.ball.inAir) return;

      const ctx = this.ctx;

      if (this.comboCount >= 2) {
        ctx.save();
        for (let i = 0; i < this.ball.trail.length; i++) {
          const t = this.ball.trail[i];
          const rad = this.ball.radius * (i / this.ball.trail.length) * 0.8;
          ctx.fillStyle = `rgba(255, 230, 0, ${t.alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      this.renderBasketballAt(this.ball.x, this.ball.y, this.ball.rotation);
    }

    renderBasketballAt(x, y, rotation) {
      const ctx = this.ctx;
      const r = this.ball.radius;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.shadowColor = '#FFE600';
      ctx.shadowBlur = this.comboCount >= 2 ? 18 : 6;

      const ballGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, r);
      ballGrad.addColorStop(0, '#ffa502');
      ballGrad.addColorStop(0.7, '#e67e22');
      ballGrad.addColorStop(1, '#b33922');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e1a17';
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-r * 0.45, 0, r * 0.85, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.45, 0, r * 0.85, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();

      ctx.restore();
    }

    renderParticles() {
      const ctx = this.ctx;

      ctx.save();
      this.fogParticles.forEach(p => {
        ctx.fillStyle = `rgba(255, 230, 0, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (this.hasDebuff('FOGGY_COURT')) {
        const fogGrad = ctx.createLinearGradient(0, this.groundY - 140, 0, this.groundY);
        fogGrad.addColorStop(0, 'rgba(15, 20, 30, 0)');
        fogGrad.addColorStop(1, 'rgba(15, 20, 30, 0.65)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, this.groundY - 140, this.virtualW, 140);
      }

      this.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // --------------------------------------------------------------------------
  // 5. APPLICATION INITIALIZATION
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberHoopsGame();
  });
})();
