export interface Rng {
  next(): number;
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  gauss(mean: number, sd: number): number;
  pick<T>(items: readonly T[]): T;
}

export function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * 64 位种子：一个「长整型」意义上的种子，或者任意字符串（一句话也行）。
 * 返回两段 32 位字，交给 makeRng64 展开成 64 位状态。
 */
export function seedWords(seed: number | string): [number, number] {
  if (typeof seed === 'number') {
    if (!Number.isSafeInteger(seed)) throw new RangeError('seed 必须是安全整数（≤ 2^53−1），或者一个字符串');
    const lo = seed >>> 0;
    const hi = Math.floor(seed / 4294967296) >>> 0;
    return [lo, hi];
  }
  const text = seed;
  if (text.length === 0) throw new RangeError('seed 不能是空字符串');
  return [hashSeed(`lo:${text}`), hashSeed(`hi:${text}`)];
}

/** 用两段 32 位字初始化 sfc32，得到完整的 64 位种子随机流。 */
export function makeRng64(lo: number, hi: number): Rng {
  let a = lo >>> 0;
  let b = hi >>> 0;
  let c = (lo ^ 0x9e3779b9) >>> 0;
  let d = (hi ^ 0x85ebca6b) >>> 0;
  const next = (): number => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    const t = (a + b + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) >>> 0;
    return (t >>> 0) / 4294967296;
  };
  // 先空转几轮，让初始状态充分混合。
  for (let i = 0; i < 12; i += 1) next();
  const range = (min: number, max: number): number => min + (max - min) * next();
  const int = (min: number, max: number): number => Math.floor(min + (max - min + 1) * next());
  const gauss = (mean: number, sd: number): number => {
    const u = Math.max(next(), 1e-12);
    const v = next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T;
  return { next, range, int, gauss, pick };
}

export function makeSeedRng(seed: number | string): Rng {
  const [lo, hi] = seedWords(seed);
  return makeRng64(lo, hi);
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const range = (min: number, max: number): number => min + (max - min) * next();
  const int = (min: number, max: number): number => Math.floor(min + (max - min + 1) * next());
  const gauss = (mean: number, sd: number): number => {
    const u = Math.max(next(), 1e-12);
    const v = next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T;
  return { next, range, int, gauss, pick };
}
