// 안개 속 마음(FeelingSphere)의 회전·배치 계산 (FEATURES.md §3.2)
// 매 프레임 바뀌는 값이라 React 상태 밖, 이 객체 하나가 가진다. 안개(ChildBlob)도 같은 회전값을 읽는다.

export type Rotation = { yaw: number; pitch: number };

/**
 * 구를 화면 어디에 얼마나 크게 놓을지.
 * - "dome": 데스크톱 — 화면 아래 끝에 중심을 둔 큰 안개(돔)의 보이는 위쪽 영역 안에
 * - "circle": 모바일 — 둥근 안개 전체의 가운데에
 */
export type SphereFrame = "dome" | "circle";

/** 기울기 완화 — 실제 표면 각도의 절반쯤만 기울여 큰 화면에서도 글이 과장되게 눕지 않게 */
const TILT = 0.5;
type Point = { x: number; y: number; z: number };

/** 캡처 모드의 고정 각도 — 앞쪽 마음 5~7개가 읽히는 각도 (FEATURES.md §3.4) */
export const STILL_ROTATION: Rotation = { yaw: 0, pitch: 0.12 };

export const SLOTS = 24;
const PITCH_LIMIT = 0.7;
const AUTO_SPEED = 0.05; // 가만히 둘 때 저절로 도는 속도 (rad/s)
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const MIN_POINTS = 8;

/** 구 표면에 고르게 흩어진 n개의 점 (피보나치 구). 마음 수에 맞춰 만든다 — 빈 자리가 많으면 앞쪽이 비어 보여서 */
function spherePoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * GOLDEN;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
}

/** 처음 각도에서 앞쪽에 가까운 자리 순서 → 최신 마음이 앞에 오도록 */
function frontOrder(points: Point[]): number[] {
  return points
    .map((p, i) => ({ i, score: p.z - Math.abs(p.y) * 0.3 }))
    .sort((a, b) => b.score - a.score)
    .map((p) => p.i);
}

const clampPitch = (v: number) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** 가장 가까운 방향으로 각도 차이 (-π ~ π) */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

function project(p: Point, rot: Rotation): Point {
  const cy = Math.cos(rot.yaw), sy = Math.sin(rot.yaw);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const cp = Math.cos(rot.pitch), sp = Math.sin(rot.pitch);
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

/** 자리 p 가 정면에 오는 회전값 */
function facing(p: Point): Rotation {
  const yaw = Math.atan2(-p.x, p.z);
  const z1 = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
  return { yaw, pitch: clampPitch(Math.atan2(p.y, z1)) };
}

/** 안개(셰이더)에 넘길 마음 위치·색. 위치는 구 중심 기준 화면 픽셀(아래가 +), 세 번째 값은 깊이(0 뒤 ~ 1 앞) */
export type FogSources = {
  count: number;
  pts: Float32Array;
  cols: Float32Array;
  /** 구 중심의 화면 좌표(픽셀)와 반지름 */
  x: number;
  y: number;
  R: number;
};

export class SphereMotion {
  rotation: Rotation = { ...STILL_ROTATION };
  private vYaw = 0;
  private vPitch = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private lastT = 0;
  private target: Rotation | null = null;
  /** 마음 id → 자리 번호. 새 마음은 비어 있는 자리(가장 오래된 마음이 빠진 자리)를 받는다 */
  private slots = new Map<string, number>();
  private points: Point[] = spherePoints(MIN_POINTS);
  /** 마음 id → 감정 색 (0~1 RGB) */
  private colors = new Map<string, [number, number, number]>();
  private fog: FogSources = { count: 0, pts: new Float32Array(SLOTS * 3), cols: new Float32Array(SLOTS * 3), x: 0, y: 0, R: 1 };
  private order: number[] = frontOrder(this.points);

  /** 안개(셰이더)가 읽는 현재 회전값 */
  getRotation = (): Rotation => this.rotation;

  /** 마음마다 감정 색 */
  setColors(colors: Map<string, [number, number, number]>) {
    this.colors = colors;
  }

  /** 안개가 매 프레임 읽는 마음 위치·색 (현재 회전 기준) */
  getFogSources = (): FogSources => {
    const f = this.fog;
    let n = 0;
    for (const [id, slot] of this.slots) {
      const c = this.colors.get(id);
      if (!c || n >= SLOTS) continue;
      const q = project(this.points[slot], this.rotation);
      f.pts[n * 3] = q.x * f.R;
      f.pts[n * 3 + 1] = -q.y * f.R;
      f.pts[n * 3 + 2] = (q.z + 1) / 2;
      f.cols[n * 3] = c[0];
      f.cols[n * 3 + 1] = c[1];
      f.cols[n * 3 + 2] = c[2];
      n++;
    }
    f.count = n;
    return f;
  };

  /** 마음 목록이 바뀌면 자리를 다시 정한다. 새로 온 마음이 있으면 그쪽으로 돌린다 */
  assign(ids: string[], turnToNew: boolean) {
    // 점 개수 = 마음 수 (8~24). 개수가 바뀌면 처음부터 다시 배정 (최신이 앞쪽)
    const n = Math.max(MIN_POINTS, Math.min(SLOTS, ids.length));
    if (n !== this.points.length) {
      this.points = spherePoints(n);
      this.order = frontOrder(this.points);
      this.slots.clear();
    }
    const first = this.slots.size === 0;
    const keep = new Set(ids);
    for (const id of [...this.slots.keys()]) if (!keep.has(id)) this.slots.delete(id);
    const used = new Set(this.slots.values());
    const free = this.order.filter((s) => !used.has(s));
    let newest: number | null = null;
    // ids 는 최신이 앞. 처음에는 최신부터 앞쪽 자리를 받는다
    for (const id of ids) {
      if (this.slots.has(id)) continue;
      const s = first ? free.shift() : free.pop();
      if (s === undefined) break;
      this.slots.set(id, s);
      if (!first && newest === null) newest = s;
    }
    if (newest !== null && turnToNew) this.target = facing(this.points[newest]);
  }

  /** 한 프레임 진행 (dt 초) */
  step(dt: number, reduced: boolean) {
    if (this.dragging) return;
    const rot = this.rotation;
    if (this.target) {
      const k = Math.min(1, dt * 2.5);
      rot.yaw += angleDelta(rot.yaw, this.target.yaw) * k;
      rot.pitch += (this.target.pitch - rot.pitch) * k;
      if (Math.abs(angleDelta(rot.yaw, this.target.yaw)) < 0.01 && Math.abs(this.target.pitch - rot.pitch) < 0.01) this.target = null;
      this.vYaw = 0;
      this.vPitch = 0;
      return;
    }
    // 관성 → 천천히 저절로 도는 속도로, 기울기는 기본 각도로 돌아온다
    this.vYaw += ((reduced ? 0 : AUTO_SPEED) - this.vYaw) * Math.min(1, dt * 1.2);
    this.vPitch += (0 - this.vPitch) * Math.min(1, dt * 2);
    rot.yaw += this.vYaw * dt;
    rot.pitch = clampPitch(rot.pitch + this.vPitch * dt);
    rot.pitch += (STILL_ROTATION.pitch - rot.pitch) * Math.min(1, dt * 0.3);
  }

  /** 캡처 모드: 고정 각도 */
  freeze() {
    this.rotation.yaw = STILL_ROTATION.yaw;
    this.rotation.pitch = STILL_ROTATION.pitch;
    this.target = null;
  }

  /**
   * 각 마음을 3D 구 표면에 놓는다 (CSS 원근). 글은 구 표면에 붙은 면이라 가장자리로 갈수록 기울어 보인다.
   * 앞쪽일수록 글이 또렷하고, 뒤쪽은 색 점만 비친다. 앞쪽 글끼리 겹치면 더 뒤에 있는 쪽을 흐리게 한다.
   */
  layout(box: HTMLElement, nodes: Map<string, HTMLElement>, frame: SphereFrame) {
    const w = box.clientWidth;
    const h = box.clientHeight;
    const cx = w / 2;
    const cy = frame === "dome" ? h * 0.6 : h / 2;
    const R = frame === "dome" ? Math.min(w * 0.28, h * 0.27) : Math.min(w, h) * 0.33;
    // 원근 거리: 반지름의 약 7배 — 멀리서 보듯 완만하게 (가까우면 큰 구에서 왜곡이 과장된다)
    box.style.perspective = `${Math.round(R * 7)}px`;
    box.style.perspectiveOrigin = `${cx.toFixed(0)}px ${cy.toFixed(0)}px`;
    // 안개가 같은 자리를 물들일 수 있도록 구 중심(화면 좌표)과 반지름을 기억
    const rect = box.getBoundingClientRect();
    this.fog.x = rect.left + cx;
    this.fog.y = rect.top + cy;
    this.fog.R = R;

    const placed: { node: HTMLElement; text: HTMLElement | null; front: number; z: number }[] = [];
    for (const [id, node] of nodes) {
      const slot = this.slots.get(id);
      if (slot === undefined) {
        node.style.opacity = "0";
        continue;
      }
      const q = project(this.points[slot], this.rotation);
      const front = smoothstep(-0.05, 0.5, q.z); // 1 = 정면 가까이
      const depth = (q.z + 1) / 2; // 0 = 뒤, 1 = 앞
      // 표면의 바깥 방향(법선)을 향하도록 회전 → 글이 구 표면에 붙은 것처럼 기운다
      const ry = Math.atan2(q.x, q.z) * TILT;
      const rx = Math.asin(Math.max(-1, Math.min(1, q.y))) * TILT;
      node.style.opacity = "1";
      node.style.transform =
        `translate3d(${(cx + q.x * R).toFixed(1)}px, ${(cy - q.y * R).toFixed(1)}px, ${(q.z * R).toFixed(1)}px) ` +
        `translate(-50%, -50%) rotateY(${ry.toFixed(4)}rad) rotateX(${rx.toFixed(4)}rad)`;
      node.style.zIndex = String(Math.round(depth * 100));
      const text = node.firstElementChild as HTMLElement | null;
      const dot = node.lastElementChild as HTMLElement | null;
      if (dot) dot.style.opacity = String((0.15 + 0.5 * depth) * (1 - front));
      placed.push({ node, text, front, z: q.z });
    }

    // 겹침 정리: 앞에 있는 글부터 자리를 차지하고, 겹치는 뒤쪽 글은 흐리게
    placed.sort((a, b) => b.z - a.z);
    const taken: DOMRect[] = [];
    for (const p of placed) {
      if (!p.text) continue;
      let opacity = p.front;
      if (opacity > 0.05) {
        const r = p.text.getBoundingClientRect();
        const inset = Math.min(r.width, r.height) * 0.15;
        const hit = taken.some(
          (t) => r.left + inset < t.right && r.right - inset > t.left && r.top + inset < t.bottom && r.bottom - inset > t.top,
        );
        if (hit) opacity *= 0.2;
        else if (opacity > 0.5) taken.push(r);
      }
      p.text.style.opacity = opacity.toFixed(3);
    }
  }

  pointerDown(x: number, y: number) {
    this.dragging = true;
    this.target = null;
    this.lastX = x;
    this.lastY = y;
    this.lastT = performance.now();
  }

  /** 끄는 중: 가로 → 좌우로, 세로 → 위아래로 돈다. 손가락은 가로만 (세로는 페이지 스크롤) */
  pointerMove(x: number, y: number, touch: boolean) {
    if (!this.dragging) return;
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.lastT) / 1000);
    const dYaw = (x - this.lastX) * 0.006;
    const dPitch = touch ? 0 : (y - this.lastY) * 0.004;
    this.rotation.yaw += dYaw;
    this.rotation.pitch = clampPitch(this.rotation.pitch + dPitch);
    this.vYaw = dYaw / dt;
    this.vPitch = dPitch / dt;
    this.lastX = x;
    this.lastY = y;
    this.lastT = now;
  }

  pointerUp() {
    this.dragging = false;
  }

  /** 키보드 화살표: 한 칸씩 부드럽게 돌기. 처리했으면 true */
  key(key: string): boolean {
    const r = this.target ?? this.rotation;
    const next: Record<string, Rotation> = {
      ArrowLeft: { yaw: r.yaw - 0.5, pitch: r.pitch },
      ArrowRight: { yaw: r.yaw + 0.5, pitch: r.pitch },
      ArrowUp: { yaw: r.yaw, pitch: clampPitch(r.pitch - 0.3) },
      ArrowDown: { yaw: r.yaw, pitch: clampPitch(r.pitch + 0.3) },
    };
    if (!next[key]) return false;
    this.target = next[key];
    return true;
  }
}
