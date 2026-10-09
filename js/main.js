/**
 * Ponto de Entrada da Aplicação (Bootstrap)
 * Baseado no Technical Requirement Document (TRD)
 */

import { ASSET_PATHS } from './utils/Constants.js';
import { Renderer } from './engine/Renderer.js';
import { InputManager } from './engine/Input.js';
import { AudioManager } from './engine/Audio.js';
import { Player } from './entities/Player.js';
import { ParallaxBackground } from './entities/ParallaxBackground.js';
import { ObstacleManager } from './entities/ObstacleManager.js';
import { Game } from './engine/Game.js';
import { FloatingMenu } from './engine/FloatingMenu.js';

// Função utilitária para pré-carregamento seguro de imagens
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Aviso: Não foi possível carregar a imagem em "${src}". Utilizando fallback procedimental.`);
      resolve(null);
    };
  });
}

async function init() {
  console.log('🎮 Inicializando Guana-Boy Engine...');

  const canvas = document.getElementById('game-screen');
  if (!canvas) {
    console.error('Elemento #game-screen não encontrado no DOM!');
    return;
  }

  // Carrega todos os assets visuais em paralelo
  const [
    groundImg,
    cloud1,
    cloud2,
    cloud3,
    walk1,
    walk2,
    walk3,
    walk4,
    jumpUp,
    jumpDown,
    landing,
    obs1,
    obs2
  ] = await Promise.all([
    loadImage(ASSET_PATHS.GROUND),
    loadImage(ASSET_PATHS.CLOUDS[0]),
    loadImage(ASSET_PATHS.CLOUDS[1]),
    loadImage(ASSET_PATHS.CLOUDS[2]),
    loadImage(ASSET_PATHS.PLAYER_WALK[0]),
    loadImage(ASSET_PATHS.PLAYER_WALK[1]),
    loadImage(ASSET_PATHS.PLAYER_WALK[2]),
    loadImage(ASSET_PATHS.PLAYER_WALK[3]),
    loadImage(ASSET_PATHS.PLAYER_JUMP_UP),
    loadImage(ASSET_PATHS.PLAYER_JUMP_DOWN),
    loadImage(ASSET_PATHS.PLAYER_LANDING),
    loadImage(ASSET_PATHS.OBSTACLES[0]),
    loadImage(ASSET_PATHS.OBSTACLES[1])
  ]);

  // Instancia subsistemas
  const renderer = new Renderer(canvas);
  const input = new InputManager();
  const audio = new AudioManager();

  // Instancia entidades com preservação de aspect ratio e física de animação
  const background = new ParallaxBackground({
    groundImage: groundImg,
    cloudImages: [cloud1, cloud2, cloud3]
  });

  const player = new Player({
    walkFrames: [walk1, walk2, walk3, walk4],
    jumpUpFrame: jumpUp,
    jumpDownFrame: jumpDown,
    landingFrame: landing
  });

  const obstacles = new ObstacleManager([obs1, obs2]);

  // Instancia e inicia o jogo
  const game = new Game({
    renderer,
    input,
    audio,
    player,
    background,
    obstacles
  });

  // Instancia o Menu Flutuante Inferior com suporte a ícones bitmap
  const floatingMenu = new FloatingMenu({ game, audio });

  // Desbloqueia o áudio na primeira interação do usuário no mobile ou desktop
  input.on('user_interacted', () => {
    audio.init();
  });

  // Sincroniza o ícone de som caso o áudio seja alternado pelo botão virtual SELECT ou tecla M
  input.on('mute', () => {
    floatingMenu.updateSoundUI();
  });

  // Alterna o zoom da tela quando acionado pelo interruptor OFF/ON ou tecla Z
  input.on('toggle_zoom', () => {
    floatingMenu.toggleZoom();
  });

  // Ativa modo smoke test caso solicitado na query string (?smoke=1)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('smoke') || urlParams.has('test')) {
    game.isSmokeTestMode = true;
    console.log('🧪 Modo Smoke Test Ativado via URL');
  }

  game.start();
  console.log('✅ Guana-Boy iniciado com sucesso.');
}

window.addEventListener('DOMContentLoaded', init);
