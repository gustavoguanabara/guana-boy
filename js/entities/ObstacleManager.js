/**
 * Gerenciador de Obstáculos e Dificuldade Progressiva
 * Baseado no Technical Requirement Document (TRD)
 */

import { CANVAS_WIDTH, PHYSICS } from '../utils/Constants.js';

export class ObstacleManager {
  constructor(imagesOrImage) {
    if (Array.isArray(imagesOrImage)) {
      this.images = imagesOrImage;
      this.legacyImage = imagesOrImage[0] || null;
    } else {
      this.images = imagesOrImage ? [imagesOrImage] : [];
      this.legacyImage = imagesOrImage || null;
    }

    this.obstacles = [];
    this.spawnTimer = 0;
    this.minSpawnInterval = 1.2; // segundos
    this.maxSpawnInterval = 2.4; // segundos
    this.nextSpawn = this._randomInterval();
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.nextSpawn = this._randomInterval();
  }

  _randomInterval() {
    return this.minSpawnInterval + Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
  }

  update(deltaTime, currentSpeed) {
    // Atualiza posição dos obstáculos existentes
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= currentSpeed * deltaTime;

      // Remove obstáculos que saíram totalmente da tela
      if (obs.x + obs.width < 0) {
        this.obstacles.splice(i, 1);
      }
    }

    // Cronômetro para novo spawn
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = this._randomInterval();
      this._spawnObstacle();
    }
  }

  _spawnObstacle() {
    // Se temos imagens individuais de obstáculos (obstaculo-01.png e 02.png: 143x153 px)
    if (this.images.length > 0 && this.images[0].naturalWidth < 300) {
      const img = this.images[Math.floor(Math.random() * this.images.length)];
      const scale = 0.28; // Escala proporcional sem distorção (40x43px)
      const w = img.naturalWidth > 0 ? img.naturalWidth : 143;
      const h = img.naturalHeight > 0 ? img.naturalHeight : 153;
      const width = Math.round(w * scale);   // ~40px
      const height = Math.round(h * scale); // ~43px

      this.obstacles.push({
        x: CANVAS_WIDTH + 10,
        y: PHYSICS.GROUND_Y - height,
        width,
        height,
        img,
        paddingTop: 4,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4
      });
      return;
    }

    // Fallback para recorte proporcional em folha única (900x200 px)
    const scale = 0.25;
    const types = [
      {
        sx: 105,
        sy: 12,
        sw: 170,
        sh: 165,
        width: Math.round(170 * scale),  // ~43px
        height: Math.round(165 * scale), // ~41px
        paddingTop: 4,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4
      },
      {
        sx: 630,
        sy: 18,
        sw: 145,
        sh: 155,
        width: Math.round(145 * scale),  // ~36px
        height: Math.round(155 * scale), // ~39px
        paddingTop: 4,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4
      }
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];

    this.obstacles.push({
      x: CANVAS_WIDTH + 10,
      y: PHYSICS.GROUND_Y - chosen.height,
      width: chosen.width,
      height: chosen.height,
      img: this.legacyImage,
      sx: chosen.sx,
      sy: chosen.sy,
      sw: chosen.sw,
      sh: chosen.sh,
      paddingTop: chosen.paddingTop,
      paddingBottom: chosen.paddingBottom,
      paddingLeft: chosen.paddingLeft,
      paddingRight: chosen.paddingRight
    });
  }

  render(ctx) {
    for (const obs of this.obstacles) {
      if (obs.img && obs.img.complete && obs.img.naturalWidth > 0) {
        if (obs.sx !== undefined) {
          // Recorte proporcional da folha
          ctx.drawImage(obs.img, obs.sx, obs.sy, obs.sw, obs.sh, obs.x, obs.y, obs.width, obs.height);
        } else {
          // Imagem individual direta
          ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);
        }
      } else {
        // Fallback visual retrô
        ctx.fillStyle = '#1f2415';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      }
    }
  }
}
