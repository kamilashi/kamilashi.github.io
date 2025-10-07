class Perlin2D {
  constructor(seed = 123456789) {
    this._rand = (() => {
      let s = seed >>> 0 || 1;
      return () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >>> 17; s >>>= 0;
        s ^= s << 5;  s >>>= 0;
        return (s >>> 0) / 0x100000000;
      };
    })();

    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;

    for (let i = 255; i > 0; i--) {
      const j = (this._rand() * (i + 1)) | 0;
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];

    this.grad2 = [
      [ 1, 0],[ -1, 0],[ 0, 1],[ 0,-1],
      [ 1, 1],[ -1, 1],[ 1,-1],[ -1,-1],
    ];
  }

  static _fade(t){ return t*t*t*(t*(t*6-15)+10); }
  static _lerp(a,b,t){ return a + t*(b-a); }

  _gradDot(ix, iy, x, y) {
    const h = this.perm[(ix + this.perm[iy & 255]) & 255] & 7; // 0..7
    const g = this.grad2[h];
    return g[0]*(x - ix) + g[1]*(y - iy);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = Perlin2D._fade(xf);
    const v = Perlin2D._fade(yf);

    const n00 = this._gradDot(X,   Y,   x, y);
    const n10 = this._gradDot(X+1, Y,   x, y);
    const n01 = this._gradDot(X,   Y+1, x, y);
    const n11 = this._gradDot(X+1, Y+1, x, y);

    const nx0 = Perlin2D._lerp(n00, n10, u);
    const nx1 = Perlin2D._lerp(n01, n11, u);
    return Perlin2D._lerp(nx0, nx1, v); 
  }

  noise01(x, y) {
    return (this.noise(x, y) * 0.5) + 0.5;
  }

  octaveNoise01(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let amp = 1.0, freq = 1.0, sum = 0.0, norm = 0.0;
    for (let i = 0; i < octaves; i++) {
      sum  += amp * this.noise01(x * freq, y * freq);
      norm += amp;
      amp  *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }
} 
 
// const perlin = new Perlin2D(42);         // seed
// perlin.noise(12.3, 45.6);      // [-1, 1]
// perlin.noise01(12.3, 45.6);    // [0, 1]
// perlin.octaveNoise01(u, v, 5, 2.0, 0.5);