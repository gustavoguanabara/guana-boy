/**
 * Utilitário de Colisão com Inset AABB Tolerante
 * Baseado no Technical Requirement Document (TRD)
 */

export class Collision {
  /**
   * Verifica sobreposição de duas caixas AABB com margem de tolerância (padding).
   * @param {Object} a - Caixa A ({x, y, width, height, paddingX, paddingY})
   * @param {Object} b - Caixa B ({x, y, width, height, paddingX, paddingY})
   * @returns {boolean} true se houver colisão
   */
  static check(a, b) {
    const padALeft = a.paddingLeft ?? a.paddingX ?? 0;
    const padARight = a.paddingRight ?? a.paddingX ?? 0;
    const padATop = a.paddingTop ?? a.paddingY ?? 0;
    const padABottom = a.paddingBottom ?? a.paddingY ?? 0;

    const padBLeft = b.paddingLeft ?? b.paddingX ?? 0;
    const padBRight = b.paddingRight ?? b.paddingX ?? 0;
    const padBTop = b.paddingTop ?? b.paddingY ?? 0;
    const padBBottom = b.paddingBottom ?? b.paddingY ?? 0;

    return (
      a.x + padALeft < b.x + b.width - padBRight &&
      a.x + a.width - padARight > b.x + padBLeft &&
      a.y + padATop < b.y + b.height - padBBottom &&
      a.y + a.height - padABottom > b.y + padBTop
    );
  }
}
