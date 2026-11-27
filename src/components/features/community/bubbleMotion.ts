// 버블 광장의 떠다님 (FEATURES.md §3.3). 매 프레임 바뀌는 값이라 React 상태 밖에서 계산하고 DOM 스타일을 직접 바꾼다.
// - 고정 시드로 겹치지 않게 흩어 놓는다 (같은 데이터면 항상 같은 배치 — 캡처 모드)
// - 느리게 떠다니다 벽·다른 버블에 부딪히면 튕긴다
// - 잡기 쉽게: 커서가 가까울수록 느려지고, 버블 위에 올리면 멈춘다 (이전 사이트)
// - 처음 배치 뒤에 생긴 버블(새 글)은 광장 아래에서 떠오른다 — 빠르게 출발해 차츰 보통 속도로

type Bubble = { el: HTMLElement; r: number; x: number; y: number; vx: number; vy: number; frozen: boolean };

const SPEED = 14; // px/s
const GAP = 16; // 처음 배치할 때 버블 사이 여백
const SLOW_RADIUS = 260; // 커서가 이 거리 안이면 느려진다
const RISE_SPEED = 260; // 새 버블이 떠오르기 시작하는 속도 (px/s)

/** id 마다 같은 난수열 (고정 시드) */
function rngFor(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  let s = h >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class BubbleMotion {
  private bubbles = new Map<string, Bubble>();
  private w = 1;
  private h = 1;
  private px = -1e5;
  private py = -1e5;
  /** 처음 배치가 끝났는지 — 이후에 생기는 버블은 아래에서 떠오른다 */
  private settled = false;

  setField(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    for (const b of this.bubbles.values()) {
      b.x = Math.min(Math.max(b.r, b.x), this.w - b.r);
      b.y = Math.min(Math.max(b.r, b.y), this.h - b.r);
    }
  }

  /** 화면에 있는 버블과 맞춘다. 새 버블은 빈자리에, 사라진 버블은 뺀다 */
  sync(nodes: Map<string, HTMLElement>) {
    for (const id of [...this.bubbles.keys()]) if (!nodes.has(id)) this.bubbles.delete(id);
    // id 순서대로 배치해야 같은 데이터면 같은 배치가 된다
    for (const id of [...nodes.keys()].sort()) {
      if (this.bubbles.has(id)) continue;
      const el = nodes.get(id)!;
      const r = el.offsetWidth / 2;
      const rng = rngFor(id);
      if (this.settled) {
        // 새 글: 광장 아래 가운데 근처에서 위로
        const x = this.w / 2 + (rng() - 0.5) * this.w * 0.3;
        this.bubbles.set(id, { el, r, x, y: this.h - r, vx: (rng() - 0.5) * SPEED, vy: -RISE_SPEED, frozen: false });
        continue;
      }
      let x = this.w / 2;
      let y = this.h / 2;
      for (let attempt = 0; attempt < 400; attempt++) {
        x = r + rng() * Math.max(1, this.w - 2 * r);
        y = r + rng() * Math.max(1, this.h - 2 * r);
        const clear = [...this.bubbles.values()].every((o) => Math.hypot(x - o.x, y - o.y) >= r + o.r + GAP);
        if (clear) break;
      }
      const angle = rng() * Math.PI * 2;
      const speed = SPEED * (0.6 + rng() * 0.8);
      this.bubbles.set(id, { el, r, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, frozen: false });
    }
    if (this.bubbles.size > 0) this.settled = true;
  }

  pointer(x: number, y: number) {
    this.px = x;
    this.py = y;
  }

  freeze(id: string, frozen: boolean) {
    const b = this.bubbles.get(id);
    if (b) b.frozen = frozen;
  }

  /** 한 프레임 이동 (dt 초) */
  step(dt: number) {
    const list = [...this.bubbles.values()];
    for (const b of list) {
      if (b.frozen) continue;
      const near = Math.hypot(b.x - this.px, b.y - this.py);
      const slow = Math.min(1, Math.max(0.15, near / SLOW_RADIUS));
      // 떠오르던 새 버블은 차츰 보통 속도로
      const speed = Math.hypot(b.vx, b.vy);
      if (speed > SPEED * 1.6) {
        const k = Math.max(SPEED * 1.6, speed * (1 - dt * 0.25)) / speed;
        b.vx *= k;
        b.vy *= k;
      }
      b.x += b.vx * dt * slow;
      b.y += b.vy * dt * slow;
      if (b.x < b.r) {
        b.x = b.r;
        b.vx = Math.abs(b.vx);
      }
      if (b.x > this.w - b.r) {
        b.x = this.w - b.r;
        b.vx = -Math.abs(b.vx);
      }
      if (b.y < b.r) {
        b.y = b.r;
        b.vy = Math.abs(b.vy);
      }
      if (b.y > this.h - b.r) {
        b.y = this.h - b.r;
        b.vy = -Math.abs(b.vy);
      }
    }
    // 버블끼리 겹치면 밀어내고, 마주 오는 속도는 서로 바꾼다
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const c = list[j];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const overlap = a.r + c.r - dist;
        if (overlap <= 0) continue;
        const nx = dx / dist;
        const ny = dy / dist;
        const share = a.frozen ? 0 : c.frozen ? 1 : 0.5;
        a.x -= nx * overlap * share;
        a.y -= ny * overlap * share;
        c.x += nx * overlap * (1 - share);
        c.y += ny * overlap * (1 - share);
        const va = a.vx * nx + a.vy * ny;
        const vc = c.vx * nx + c.vy * ny;
        if (va - vc > 0) {
          a.vx += (vc - va) * nx;
          a.vy += (vc - va) * ny;
          c.vx += (va - vc) * nx;
          c.vy += (va - vc) * ny;
        }
      }
    }
  }

  render() {
    for (const b of this.bubbles.values()) {
      b.el.style.transform = `translate(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px)`;
      b.el.style.opacity = "1";
    }
  }
}
