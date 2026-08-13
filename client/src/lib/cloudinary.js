const CLOUD_NAME = "jevkjkzb" // still needs your real cloud name

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`

export function cldImage(publicId, { w = 900 } = {}) {
  return `${BASE}/image/upload/f_auto,q_auto,dpr_auto,c_fill,w_${w}/${publicId}`
}

export function cldVideo(publicId, { w = 900 } = {}) {
  return `${BASE}/video/upload/f_auto,q_auto,w_${w}/${publicId}`
}

export function cldVideoPoster(publicId, { w = 900 } = {}) {
  return `${BASE}/video/upload/so_0,f_jpg,q_auto,w_${w}/${publicId}.jpg`
}