// Maps PLACE_REGISTRY category names (server-side) to a representative
// fallback photo, shown when a place's photoUrl is null (Wikimedia +
// Mapillary both missed, or it was beyond the server's enrichment limit).
//
// FIX: this used to fall through to a generic skyline stock photo
// (GENERIC_FALLBACK) for anything not in CATEGORY_IMAGES — which is
// actively misleading on a card (a dessert shop showing a city skyline
// looks like a data error, not "no photo available"). There is no longer
// a generic *photo* fallback. getCategoryFallbackImage() now returns null
// when there's no direct match, and PlaceCard renders an icon placeholder
// instead of an <img> in that case — honest about not having a photo
// rather than showing an unrelated one.

const CATEGORY_IMAGES = {
  Restaurants: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70",
  "Fast Food": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=70",
  Cafes: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70",
  "Coffee Shops": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=70",
  Bakeries: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=70",
  Bars: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=70",
  Pubs: "https://images.unsplash.com/photo-1546622891-02c72c1537b6?w=800&q=70",

  Hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=70",
  Hostels: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=70",
  "Guest Houses": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=70",

  Parks: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=70",
  "National Parks": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70",
  Beaches: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=70",
  Mountains: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=70",
  Lakes: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=70",
  Waterfalls: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=70",
  "Botanical Gardens": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=70",

  Museums: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=70",
  "Art Galleries": "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=70",
  "Tourist Attractions": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=70",
  Castles: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800&q=70",

  Cinemas: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=70",
  Nightclubs: "https://images.unsplash.com/photo-1571266028243-d220c9c3b31c?w=800&q=70",
  "Amusement Parks": "https://images.unsplash.com/photo-1560237731-890b122a9b6a?w=800&q=70",
  Zoos: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=70",

  "Shopping Malls": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&q=70",
  Markets: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=70",
  Bookstores: "https://images.unsplash.com/photo-1521123845560-14093637aa7d?w=800&q=70",

  Gyms: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70",
  "Swimming Pools": "https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&q=70",
  "Golf Courses": "https://images.unsplash.com/photo-1587174786622-975606d0aaa0?w=800&q=70",

  Churches: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=70",
  Temples: "https://images.unsplash.com/photo-1518002054494-3a6f94352e91?w=800&q=70",
}

/** Returns a representative photo URL only for a direct category match, or null. */
export function getCategoryFallbackImage(category) {
  if (!category) return null
  return CATEGORY_IMAGES[category] || null
}

// --- Icon fallback, used when there's no real photo AND no direct entry
// above. Grouped by keyword so the ~150 PLACE_REGISTRY categories that
// don't have a hand-picked photo still get something honestly generic
// but topically relevant (a fork icon for "Ice Cream Shops", a tree icon
// for "Nature Reserves"), rather than either a wrong photo or a totally
// blank card. Lucide icon *names* are exported here (as strings) rather
// than components, so this file has no React/JSX dependency — PlaceCard
// resolves the name to the actual icon component.

const ICON_GROUPS = [
  {
    label: "Food & drink",
    icon: "Utensils",
    bg: "#FDF0E4",
    fg: "#C2703D",
    keywords: ["restaurant", "food", "eat", "cafe", "coffee", "bakery", "bar", "pub", "bistro", "diner", "sweet", "dessert", "ice cream", "snack", "brewery", "wine", "juice"],
  },
  {
    label: "Stay",
    icon: "BedDouble",
    bg: "#EAF1FB",
    fg: "#2F5FA8",
    keywords: ["hotel", "hostel", "guest house", "motel", "resort", "inn", "lodg", "camp"],
  },
  {
    label: "Nature",
    icon: "Trees",
    bg: "#EAF6EC",
    fg: "#357A46",
    keywords: ["park", "forest", "beach", "mountain", "lake", "waterfall", "garden", "nature", "trail", "river", "hill", "reserve"],
  },
  {
    label: "Culture",
    icon: "Landmark",
    bg: "#F2EEF9",
    fg: "#6B4FA0",
    keywords: ["museum", "gallery", "attraction", "castle", "church", "temple", "monument", "heritage", "memorial", "mosque", "shrine"],
  },
  {
    label: "Entertainment",
    icon: "Drama",
    bg: "#FDEEF3",
    fg: "#C24374",
    keywords: ["cinema", "theatre", "theater", "nightclub", "club", "amusement", "zoo", "arcade", "bowling", "karaoke", "casino"],
  },
  {
    label: "Shopping",
    icon: "ShoppingBag",
    bg: "#FEF6E3",
    fg: "#B8862E",
    keywords: ["mall", "market", "shop", "store", "bookstore", "boutique", "supermarket", "mobile phone"],
  },
  {
    label: "Fitness",
    icon: "Dumbbell",
    bg: "#EAF7F6",
    fg: "#1E8A81",
    keywords: ["gym", "fitness", "pool", "swim", "golf", "sport", "court", "stadium", "martial arts", "yoga"],
  },
  {
    label: "Services",
    icon: "Building2",
    bg: "#F1F2F4",
    fg: "#5B6472",
    keywords: ["bank", "atm", "hospital", "clinic", "pharmacy", "school", "office", "salon", "repair", "laundry", "post"],
  },
]

const GENERIC_ICON_META = { label: "Place", icon: "MapPin", bg: "#F1F2F4", fg: "#5B6472" }

/**
 * Returns { label, icon, bg, fg } — never null, always safe to render.
 * `icon` is a lucide-react icon *name* (string); see PlaceCard for the
 * name → component lookup.
 */
export function getCategoryIconMeta(category) {
  if (!category) return GENERIC_ICON_META
  const q = category.toLowerCase()
  for (const group of ICON_GROUPS) {
    if (group.keywords.some((kw) => q.includes(kw))) {
      return { label: group.label, icon: group.icon, bg: group.bg, fg: group.fg }
    }
  }
  return GENERIC_ICON_META
}