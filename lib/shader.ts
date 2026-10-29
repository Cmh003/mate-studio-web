// Escena 3D del logo "m." dibujada con raymarching en un único fragment shader.
// El uniform `s` (0 → 1) es el avance de la historia con el scroll:
//   0.00–0.20  Punto: la esfera lima flota sola.
//   0.20–0.66  Línea y forma: el punto hace de lápiz y dibuja la "m".
//   0.68–0.78  Marca: el punto salta a su sitio, junto a la "m".
//   0.80–0.96  El logo gira 360° para enseñar que es 3D.

export const VERTEX_SHADER = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

export const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 r;
uniform float t;
uniform float s;
uniform vec2 m;
uniform float ox;
uniform float hd;

const float PI = 3.14159265;
const float TR = 0.19;      // grosor del trazo
const float LL = 1.16667;   // largo de cada pata
const float AA = 1.570796;  // largo de cada arco

vec3 O; float YAW; float PIT; float SHX;
vec3 DP; float DR; float BLEND; float DD; float HD;

mat2 rot(float a){ float c = cos(a), z = sin(a); return mat2(c, -z, z, c); }

float smin(float a, float b, float k){
  if (k <= 0.0) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float cap(vec3 p, vec3 a, vec3 b, float rr){
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h) - rr;
}

float fr(float st, float ln){ return clamp((DD - st) / ln, 0.0, 1.0); }

float seg(vec3 p, vec2 a, vec2 b, float f){
  if (f <= 0.0) return 1e3;
  return cap(p, vec3(a, 0.0), vec3(mix(a, b, f), 0.0), TR);
}

float arc(vec3 p, vec2 c, float f){
  if (f <= 0.0) return 1e3;
  vec2 q = p.xy - c;
  float a = atan(q.y, q.x);
  float ae = PI * (1.0 - f);
  if (q.y >= 0.0 && a >= ae) return length(vec2(length(q) - 0.5, p.z)) - TR;
  vec2 e0 = c + vec2(-0.5, 0.0);
  vec2 e1 = c + 0.5 * vec2(cos(ae), sin(ae));
  return min(length(p - vec3(e0, 0.0)), length(p - vec3(e1, 0.0))) - TR;
}

// Posición de la punta del lápiz a lo largo del trazo de la "m"
vec2 tip(){
  float b = LL, c = LL + AA, d = 2.0 * LL + AA, e = 3.0 * LL + AA, f = 3.0 * LL + 2.0 * AA;
  if (DD < b) return mix(vec2(-1.0, -0.8333), vec2(-1.0, 0.3333), fr(0.0, LL));
  if (DD < c) { float a = PI * (1.0 - fr(b, AA)); return vec2(-0.5, 0.3333) + 0.5 * vec2(cos(a), sin(a)); }
  if (DD < d) return mix(vec2(0.0, 0.3333), vec2(0.0, -0.8333), fr(c, LL));
  if (DD < e) return mix(vec2(0.0, -0.8333), vec2(0.0, 0.3333), fr(d, LL));
  if (DD < f) { float a = PI * (1.0 - fr(e, AA)); return vec2(0.5, 0.3333) + 0.5 * vec2(cos(a), sin(a)); }
  return mix(vec2(1.0, 0.3333), vec2(1.0, -0.8333), fr(f, LL));
}

vec3 toL(vec3 p){ vec3 q = p - O; q.xz *= rot(YAW); q.yz *= rot(PIT); q.x += SHX; return q; }
vec3 toW(vec3 l){ vec3 q = l; q.x -= SHX; q.yz *= rot(-PIT); q.xz *= rot(-YAW); return q + O; }

float tube(vec3 q){
  float b = LL, c = LL + AA, e = 3.0 * LL + AA, f = 3.0 * LL + 2.0 * AA;
  float d = seg(q, vec2(-1.0, -0.8333), vec2(-1.0, 0.3333), fr(0.0, LL));
  d = min(d, arc(q, vec2(-0.5, 0.3333), fr(b, AA)));
  d = min(d, seg(q, vec2(0.0, 0.3333), vec2(0.0, -0.8333), fr(c, LL)));
  d = min(d, arc(q, vec2(0.5, 0.3333), fr(e, AA)));
  d = min(d, seg(q, vec2(1.0, 0.3333), vec2(1.0, -0.8333), fr(f, LL)));
  return d;
}

vec2 map(vec3 p){
  vec3 q = toL(p);
  float a = tube(q);
  float b = HD > 0.5 ? 1e3 : length(q - DP) - DR;
  float d = smin(a, b, BLEND);
  return vec2(d, b < a ? 2.0 : 1.0);
}

vec3 nrm(vec3 p){
  vec2 e = vec2(0.0012, 0.0);
  return normalize(vec3(
    map(p + e.xyy).x - map(p - e.xyy).x,
    map(p + e.yxy).x - map(p - e.yxy).x,
    map(p + e.yyx).x - map(p - e.yyx).x));
}

float shadow(vec3 ro, vec3 rd){
  float res = 1.0; float d = 0.05;
  for (int i = 0; i < 28; i++) {
    float h = map(ro + rd * d).x;
    res = min(res, 10.0 * h / d);
    d += clamp(h, 0.03, 0.4);
    if (res < 0.01 || d > 6.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ao(vec3 p, vec3 n){
  float o = 0.0, w = 1.0;
  for (int i = 1; i <= 4; i++) { float h = 0.06 * float(i); o += (h - map(p + n * h).x) * w; w *= 0.6; }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  HD = hd;

  float toPen = smoothstep(0.1, 0.2, s);
  float K = smoothstep(0.22, 0.66, s);
  DD = K * (4.0 * LL + 2.0 * AA);
  float hop = smoothstep(0.68, 0.78, s);
  float spin = smoothstep(0.8, 0.96, s);

  vec3 tp = vec3(tip(), 0.0);
  DP = mix(vec3(0.0, -0.15, 0.0), tp, toPen);
  DP = mix(DP, vec3(1.567, -0.767, 0.0), hop);
  DP.y += sin(hop * PI) * 0.7 + (1.0 - toPen) * sin(t * 1.3) * 0.07;
  DR = mix(0.55, 0.27, toPen);
  DR = mix(DR, 0.25, hop);
  BLEND = HD > 0.5 ? 0.0 : 0.14 * toPen * (1.0 - hop);

  O = vec3(ox, 0.25, 0.0);
  YAW = m.x * 0.35 + sin(t * 0.4) * 0.16 * (1.0 - spin) + spin * 2.0 * PI;
  PIT = 0.12 + m.y * 0.18;
  SHX = -0.28 * smoothstep(0.2, 0.7, s);

  vec3 L = normalize(vec3(-0.22, 0.95, 0.55));
  vec3 kc = vec3(1.0, 0.97, 0.92);
  float limeK = 1.5;

  vec3 ro = vec3(0.0, 0.35, 6.4);
  vec3 rd = normalize(vec3(uv, -2.05));
  rd.yz *= rot(0.035);
  vec3 lime = vec3(0.776, 0.957, 0.196);
  vec3 bg = vec3(0.0012);
  vec3 col = bg;

  float floorY = O.y - 1.32;
  float tf = rd.y < 0.0 ? (floorY - ro.y) / rd.y : 1e9;

  float d = 0.0; float hit = 0.0; float mat = 0.0; vec3 p;
  for (int i = 0; i < 90; i++) {
    p = ro + rd * d;
    vec2 h = map(p);
    if (h.x < 0.0012) { hit = 1.0; mat = h.y; break; }
    d += h.x;
    if (d > 12.0 || d > tf) break;
  }

  vec3 dpw = toW(DP);

  if (hit > 0.5 && d < tf) {
    vec3 n = nrm(p); vec3 v = -rd;
    float di = max(dot(n, L), 0.0);
    float sh = shadow(p + n * 0.004, L);
    float oc = ao(p, n);
    float sp = pow(max(dot(reflect(-L, n), v), 0.0), 56.0);
    float fre = pow(1.0 - max(dot(n, v), 0.0), 4.0);
    vec3 toD = dpw - p; float dd = length(toD);
    float glow = (1.0 - HD) * max(dot(n, toD / dd), 0.0) / (1.0 + 9.0 * dd * dd);
    if (mat < 1.5) {
      vec3 alb = vec3(0.86, 0.86, 0.83);
      col = alb * (0.05 * oc + 0.95 * di * sh * kc);
      col += alb * vec3(0.55, 0.6, 0.7) * 0.12 * oc * (0.5 + 0.5 * n.y);
      col += sp * sh * 0.45 * kc + fre * vec3(0.22) * oc;
      col += lime * glow * 1.6 * limeK;
    } else {
      col = lime * (0.5 + 0.6 * di * sh) + sp * 1.2 + fre * vec3(0.9, 1.0, 0.6) * 0.6;
    }
  } else if (tf < 1e8) {
    vec3 fp = ro + rd * tf;
    float sh = shadow(fp + vec3(0.0, 0.002, 0.0), L);
    float near = 1.0 - smoothstep(1.0, 10.0, tf);
    vec3 fc = vec3(0.0045) * (0.35 + 0.65 * sh);
    float pool = (1.0 - HD) * exp(-1.6 * length(fp.xz - dpw.xz));
    fc += lime * pool * 0.05 * limeK * (1.0 + 0.4 * sin(t * 1.5));
    col = mix(bg, fc, near * (1.0 - smoothstep(-0.25, -0.02, rd.y)));
  }

  vec2 q = gl_FragCoord.xy / r;
  col *= 1.0 - 0.3 * pow(length(q - 0.5) * 1.3, 2.0);
  col = pow(col, vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
`;
