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

    this._periodX = null;
    this._periodY = null;
  }

  setPeriod(px, py = px) {
    this._periodX = (px != null) ? Math.max(1, Math.floor(px)) : null;
    this._periodY = (py != null) ? Math.max(1, Math.floor(py)) : null;
  }
  clearPeriod() { this._periodX = this._periodY = null; }

  static _fade(t){ return t*t*t*(t*(t*6-15)+10); }
  static _lerp(a,b,t){ return a + t*(b-a); }
  static _mod(n, m){ return ((n % m) + m) % m; }

  _hash(ix, iy) {
    return (this.perm[(ix + this.perm[iy & 255]) & 255] & 7);
  }

  // [-1,1]
  noise(x, y) {
    const xi0 = Math.floor(x), yi0 = Math.floor(y);
    const xf  = x - xi0,       yf  = y - yi0;
    const u = Perlin2D._fade(xf), v = Perlin2D._fade(yf);

    let X0, Y0, X1, Y1;
    if (this._periodX != null && this._periodY != null) {
      X0 = Perlin2D._mod(xi0, this._periodX);
      Y0 = Perlin2D._mod(yi0, this._periodY);
      X1 = Perlin2D._mod(xi0 + 1, this._periodX);
      Y1 = Perlin2D._mod(yi0 + 1, this._periodY);
    } else {
      X0 = xi0 & 255; Y0 = yi0 & 255;
      X1 = (xi0 + 1) & 255; Y1 = (yi0 + 1) & 255;
    }

    const g00 = this.grad2[this._hash(X0, Y0)];
    const g10 = this.grad2[this._hash(X1, Y0)];
    const g01 = this.grad2[this._hash(X0, Y1)];
    const g11 = this.grad2[this._hash(X1, Y1)];

    const n00 = g00[0]* (xf    ) + g00[1]* (yf    );
    const n10 = g10[0]* (xf-1.0) + g10[1]* (yf    );
    const n01 = g01[0]* (xf    ) + g01[1]* (yf-1.0);
    const n11 = g11[0]* (xf-1.0) + g11[1]* (yf-1.0);

    const nx0 = Perlin2D._lerp(n00, n10, u);
    const nx1 = Perlin2D._lerp(n01, n11, u);
    return Perlin2D._lerp(nx0, nx1, v);
  }

  // [0,1]
  noise01(x, y) { return (this.noise(x, y) * 0.5) + 0.5; }

  // fBm in [0,1]
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