/**
 * 值噪声（deterministic），经度方向按 periodX 周期化。
 *
 * 只用整数哈希，不依赖随机数发生器状态，所以同一 (seed, x, y, periodX) 永远同一结果。
 */

function hash2d(seed: number, x: number, y: number): number {
  let h = (seed ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function valueNoise(seed: number, x: number, y: number, periodX: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const period = Math.max(1, Math.round(periodX));
  const wrap = (v: number): number => ((v % period) + period) % period;
  const v00 = hash2d(seed, wrap(x0), y0);
  const v10 = hash2d(seed, wrap(x0 + 1), y0);
  const v01 = hash2d(seed, wrap(x0), y0 + 1);
  const v11 = hash2d(seed, wrap(x0 + 1), y0 + 1);
  return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
}

/** 分形叠加，返回 0…1。periodX 是 x 方向的整数周期。 */
export function fbm(
  seed: number,
  x: number,
  y: number,
  octaves: number,
  periodX: number,
): number {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += amplitude * valueNoise(seed + i * 1013, x * frequency, y * frequency, periodX * frequency);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / norm;
}
