/* Decorative floating gradient shapes flanking the hero.
   Purely ornamental — hidden from assistive tech. */
const SHAPE_BASE = 'absolute h-auto select-none [-webkit-user-drag:none] [will-change:transform]';
const SHADOW = '[filter:drop-shadow(0_18px_40px_rgba(33,120,50,0.16))]';
// tint the cyan/purple PNGs to the brand mint green while keeping their 3D shading.
// NOTE: must be a single filter string — order matters (sepia before hue-rotate),
// which Tailwind's individual filter utilities can't express.
const TINT =
  '[filter:grayscale(1)_sepia(1)_hue-rotate(72deg)_saturate(1.9)_brightness(1.06)_drop-shadow(0_18px_40px_rgba(33,120,50,0.16))]';

export default function HeroDecor({ busy = false }: { busy?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden"
      aria-hidden="true"
    >
      {/* ring — upper left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${SHAPE_BASE} ${TINT} left-[3.5%] top-24 w-[92px] animate-shape-b9 motion-reduce:animate-none max-[600px]:hidden`}
        src="/images/circle-448f73d1.png"
        alt=""
      />
      {/* droplet (color token) — lower left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${SHAPE_BASE} ${SHADOW} left-[5.5%] top-[322px] w-[104px] animate-shape-d11 motion-reduce:animate-none max-[980px]:hidden max-[600px]:block max-[600px]:left-[-10px] max-[600px]:top-[466px] max-[600px]:w-[86px] ${busy ? 'max-[600px]:!hidden' : ''}`}
        src="/images/drop.png"
        alt=""
      />
      {/* squiggle — upper right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${SHAPE_BASE} ${TINT} right-[3.5%] top-[104px] w-[100px] animate-shape-c10 motion-reduce:animate-none max-[600px]:top-[2px] max-[600px]:right-[-24px] max-[600px]:w-[52px]`}
        src="/images/worm-e8f0c8f6.png"
        alt=""
      />
      {/* curly braces (JSON output) — lower right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${SHAPE_BASE} ${SHADOW} right-[4%] top-[320px] w-[122px] animate-shape-b12 motion-reduce:animate-none max-[980px]:hidden`}
        src="/images/braces.png"
        alt=""
      />
    </div>
  );
}
