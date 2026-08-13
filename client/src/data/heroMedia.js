import { cldImage, cldVideo, cldVideoPoster } from "@/lib/cloudinary"

const RAW_POOL = [
  { type: "video", id: "planefly", alt: "Aircraft in flight" },
  { type: "image", id: "rooms", alt: "Hotel room" },
  { type: "image", id: "hotair", alt: "Hot air balloons at sunrise" },
  { type: "image", id: "tallbuildings", alt: "City skyline" },
  { type: "image", id: "rest", alt: "Restaurant interior" },
  { type: "image", id: "park", alt: "City park" },
  { type: "image", id: "rooms1", alt: "Hotel suite" },
  { type: "image", id: "restaurent", alt: "Restaurant table" },
  { type: "video", id: "airport", alt: "Airport terminal" },
  { type: "image", id: "ballon", alt: "Hot air balloon over a valley" },
  { type: "image", id: "city", alt: "City street at dusk" },
  { type: "video", id: "waterfalll", alt: "Waterfall" },
  { type: "video", id: "seaa", alt: "Sea coastline" },
]

// bento tiles are small — no need to ship 1200px+ images/video into a
// 300px grid cell. Tune `w` down further if you want it leaner still.
export const MEDIA_POOL = RAW_POOL.map((item) => ({
  ...item,
  src: item.type === "video" ? cldVideo(item.id, { w: 720 }) : cldImage(item.id, { w: 720 }),
  poster: item.type === "video" ? cldVideoPoster(item.id, { w: 720 }) : undefined,
}))

export const EARTH = {
  src: cldVideo("earth", { w: 640 }),
  poster: cldVideoPoster("earth", { w: 640 }),
}