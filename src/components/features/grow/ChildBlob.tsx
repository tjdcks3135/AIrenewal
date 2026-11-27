"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { ShaderMaterial } from "three";
import { SLOTS, type FogSources, type Rotation } from "./sphereMotion";

// DESIGN.md §3 ChildBlob — AI키우기의 아이 (FEATURES.md §3.1)
// 화면 크기 사각형 위 2D 프래그먼트 셰이더. 유기적 덩어리가 천천히 숨 쉰다.
// 색: 안개 속에 떠 있는 마음들이 자기 자리 주변을 자기 감정 색으로 물들인다 — 구를 돌리면 색도 함께 돈다.
// 표현: "안개" — 가장자리가 넓게 번지는 빛 덩어리 (PAGES.md §7, 2026-11-27 확정)
// 캡처 모드(still): 시간을 고정한다 (마음이 늦게 불러와져도 반영되도록 그리기는 계속).

type ChildBlobProps = {
  /** 0~1 존재감 — 마음이 쌓일수록 조금 커지고 또렷해진다 */
  presence: number;
  /** 캡처 모드: 움직임 없이 한 장면 */
  still: boolean;
  /** 움직임 줄이기: 아주 느리게 */
  reduced: boolean;
  /** 안개 속 마음(FeelingSphere)과 같은 회전값 — 돌리면 안개의 결도 같은 방향으로 흐른다 */
  getRotation?: () => Rotation;
  /** 안개 속 마음들의 위치·감정 색 (매 프레임). 마음이 없으면 희미한 기본 형태 */
  getSources?: () => FogSources;
  /** 없으면 장식으로 본다 (스크린리더가 건너뜀) */
  label?: string;
  className?: string;
};

/** 캡처 모드에서 쓰는 고정 시각 — 같은 데이터면 항상 같은 모양 (FEATURES.md §3.4) */
const STILL_TIME = 42;

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// simplex noise 3D — Ashima Arts / Stefan Gustavson (MIT License)
const NOISE = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uAspect;
uniform float uPresence;
uniform vec3 uPts[${SLOTS}];
uniform vec3 uPtCols[${SLOTS}];
uniform int uCount;
uniform float uSigma;
uniform vec3 uIdle;
uniform vec2 uRotate;
varying vec2 vUv;
${NOISE}
void main() {
  // 짧은 변 기준 -1~1 좌표 (화면 비율이 달라도 아이는 둥글게)
  vec2 p = vUv * 2.0 - 1.0;
  if (uAspect > 1.0) p.x *= uAspect; else p.y /= uAspect;

  float t = uTime * 0.12;
  float r0 = 0.7 + 0.12 * uPresence;
  vec2 rp = p + uRotate * 0.6;
  float n = snoise(vec3(rp * 1.2, t)) * 0.6 + snoise(vec3(rp * 2.4 + 3.1, t * 1.5)) * 0.25;
  float breath = sin(uTime * 0.55) * 0.018;
  float r = r0 * (1.0 + 0.16 * n + breath);
  float dist = length(p);
  float d = dist - r;

  // 색: 마음마다 자기 자리 주변을 자기 감정 색으로 물들인다 (앞쪽 마음일수록 진하게).
  // 경계가 둥근 원으로 보이지 않도록 노이즈로 살짝 일렁이게. 먼 곳은 전체 평균 색.
  vec2 warp = vec2(snoise(vec3(p * 1.4, t)), snoise(vec3(p * 1.4 + 7.3, t))) * 0.1;
  vec2 pw = p + warp;
  vec3 col = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < ${SLOTS}; i++) {
    if (i >= uCount) break;
    vec2 dv = pw - uPts[i].xy;
    float w = exp(-dot(dv, dv) / (uSigma * uSigma)) * (0.2 + 0.8 * uPts[i].z) + 0.01;
    col += uPtCols[i] * w;
    wsum += w;
  }
  col = wsum > 0.0 ? col / wsum : uIdle;
  // 섞이며 빠진 채도를 조금 되살린다
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(lum), col, 1.3), 0.0, 1.0);
  // 안쪽은 살짝 밝게 (빛이 고인 듯)
  float core = 1.0 - smoothstep(0.0, r, dist);
  col = mix(col, vec3(1.0), 0.15 * core * core);

  // 안개: 가장자리가 넓게 번진다
  float a = (1.0 - smoothstep(-0.28, 0.1, d)) * (0.72 + 0.25 * uPresence);
  if (wsum <= 0.0) a *= 0.45; // 기본 형태는 더 희미하게
  gl_FragColor = vec4(col * a, a);
}
`;

const IDLE: [number, number, number] = [0.78, 0.81, 0.79];

/** 셰이더 uniform 초기값. 이후 값은 material ref 로 바꾼다 (R3F 방식) */
function createUniforms() {
  return {
    uTime: { value: STILL_TIME },
    uAspect: { value: 1 },
    uPresence: { value: 0 },
    uPts: { value: new Float32Array(SLOTS * 3) },
    uPtCols: { value: new Float32Array(SLOTS * 3) },
    uCount: { value: 0 },
    uSigma: { value: 0.3 },
    uIdle: { value: IDLE as number[] },
    uRotate: { value: [0, 0] as number[] },
  };
}

type Uniforms = ReturnType<typeof createUniforms>;

/**
 * 한 프레임: 시간·회전을 반영하고, 마음 위치를 이 캔버스의 셰이더 좌표로 옮긴다.
 * 셰이더 좌표 p 는 짧은 변 기준 -1~1, 위쪽이 + (마음 위치는 화면 픽셀, 아래쪽이 +)
 */
function sync(u: Uniforms, canvas: HTMLCanvasElement, dt: number, rot?: Rotation, src?: FogSources) {
  u.uTime.value += dt;
  if (rot) u.uRotate.value = [rot.yaw, rot.pitch];
  if (!src) return;
  const r = canvas.getBoundingClientRect();
  const half = Math.max(1, Math.min(r.width, r.height) / 2);
  const ox = (src.x - (r.left + r.width / 2)) / half;
  const oy = -(src.y - (r.top + r.height / 2)) / half;
  for (let i = 0; i < src.count; i++) {
    u.uPts.value[i * 3] = ox + src.pts[i * 3] / half;
    u.uPts.value[i * 3 + 1] = oy - src.pts[i * 3 + 1] / half;
    u.uPts.value[i * 3 + 2] = src.pts[i * 3 + 2];
  }
  u.uPtCols.value.set(src.cols.subarray(0, src.count * 3));
  u.uCount.value = src.count;
  // 물들이는 범위: 구 반지름의 약 0.8배 — 이웃 마음 색과 부드럽게 섞일 만큼
  u.uSigma.value = Math.max(0.05, (src.R / half) * 0.8);
}

function BlobPlane({ presence, still, reduced, getRotation, getSources }: Omit<ChildBlobProps, "label" | "className">) {
  const material = useRef<ShaderMaterial>(null);
  const size = useThree((s) => s.size);
  const canvas = useThree((s) => s.gl.domElement);
  const initialUniforms = useMemo(() => createUniforms(), []);

  useEffect(() => {
    const u = material.current?.uniforms as Uniforms | undefined;
    if (!u) return;
    u.uPresence.value = presence;
    u.uAspect.value = size.width / Math.max(1, size.height);
    if (still) u.uTime.value = STILL_TIME;
  }, [presence, size, still]);

  useFrame((_, delta) => {
    const u = material.current?.uniforms as Uniforms | undefined;
    if (!u) return;
    const dt = still ? 0 : Math.min(delta, 0.1) * (reduced ? 0.15 : 1);
    sync(u, canvas, dt, getRotation?.(), getSources?.());
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={initialUniforms}
        transparent
        premultipliedAlpha
        depthWrite={false}
      />
    </mesh>
  );
}

export function ChildBlob({ label, className, ...props }: ChildBlobProps) {
  return (
    <div role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      <Canvas
        flat
        linear
        // 안개는 원래 흐릿해서 고해상도가 필요 없다. 화면 폭만 한 큰 캔버스에서도 가볍게
        dpr={1}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: props.still }}
      >
        <BlobPlane {...props} />
      </Canvas>
    </div>
  );
}
