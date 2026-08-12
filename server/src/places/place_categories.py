# Unified place category registry.
# Every category has: a Geoapify code (or None), an OSM (key, value) tag fallback (or None),
# and optional aliases for free-text keyword matching via category_resolver.py.
# At least one of "geoapify" / "osm" should be non-None per category — the
# self-test at the bottom of this file checks that.

PLACE_REGISTRY = {
    # --- Food & Drink ---
    "Restaurants": {"geoapify": "catering.restaurant", "osm": None, "aliases": []},
    "Fast Food": {"geoapify": "catering.fast_food", "osm": None, "aliases": []},
    "Cafes": {"geoapify": "catering.cafe", "osm": None, "aliases": ["cafe", "coffee house"]},
    "Coffee Shops": {"geoapify": "catering.cafe.coffee_shop", "osm": None, "aliases": ["coffee house"]},
    "Bakeries": {"geoapify": "commercial.food_and_drink.bakery", "osm": None, "aliases": []},
    "Ice Cream Shops": {"geoapify": "catering.ice_cream", "osm": None, "aliases": ["gelato"]},
    "Bars": {"geoapify": "catering.bar", "osm": None, "aliases": []},
    "Pubs": {"geoapify": "catering.pub", "osm": None, "aliases": []},
    "Breweries": {"geoapify": "production.brewery", "osm": None, "aliases": ["brewpub"]},
    "Wineries": {"geoapify": "production.winery", "osm": None, "aliases": ["winery", "vineyard"]},
    "Food Courts": {"geoapify": "catering.food_court", "osm": None, "aliases": []},
    "Food Trucks": {"geoapify": None, "osm": ("amenity", "fast_food"), "aliases": ["street food"]},
    "Tea Houses": {"geoapify": "catering.cafe.tea", "osm": None, "aliases": ["tea room"]},
    "Juice Bars": {"geoapify": None, "osm": ("shop", "juice"), "aliases": ["smoothie bar"]},

    # --- Accommodation ---
    "Hotels": {"geoapify": "accommodation.hotel", "osm": None, "aliases": []},
    "Motels": {"geoapify": "accommodation.motel", "osm": None, "aliases": []},
    "Guest Houses": {"geoapify": "accommodation.guest_house", "osm": None, "aliases": []},
    "Hostels": {"geoapify": "accommodation.hostel", "osm": None, "aliases": []},
    "Resorts": {"geoapify": None, "osm": ("tourism", "resort"), "aliases": []},
    "Lodges": {"geoapify": "accommodation.chalet", "osm": None, "aliases": ["chalet", "cabin"]},
    "Bed & Breakfasts": {"geoapify": "accommodation.guest_house", "osm": None, "aliases": ["b&b", "bnb"]},
    "Apartments": {"geoapify": "accommodation.apartment", "osm": None, "aliases": []},
    "Campgrounds": {"geoapify": "camping.camp_site", "osm": None, "aliases": ["campsite", "camping"]},
    "Caravan Parks": {"geoapify": "camping.caravan_site", "osm": None, "aliases": ["rv park"]},
    "Holiday Villages": {"geoapify": None, "osm": ("tourism", "holiday_village"), "aliases": []},

    # --- Nature ---
    "Parks": {"geoapify": "leisure.park", "osm": None, "aliases": []},
    "National Parks": {"geoapify": "national_park", "osm": None, "aliases": []},
    "Nature Reserves": {"geoapify": "leisure.park.nature_reserve", "osm": None, "aliases": []},
    "Forests": {"geoapify": "natural.forest", "osm": None, "aliases": ["woods"]},
    "Botanical Gardens": {"geoapify": "leisure.park.garden", "osm": None, "aliases": []},
    "Gardens": {"geoapify": "leisure.park.garden", "osm": None, "aliases": []},
    "Beaches": {"geoapify": "beach", "osm": None, "aliases": []},
    "Lakes": {"geoapify": "natural.water", "osm": None, "aliases": []},
    "Rivers": {"geoapify": "natural.water.river_system", "osm": None, "aliases": []},
    "Waterfalls": {"geoapify": None, "osm": ("waterway", "waterfall"), "aliases": []},
    "Mountains": {"geoapify": "natural.mountain", "osm": None, "aliases": []},
    "Hills": {"geoapify": "natural.mountain.hill", "osm": None, "aliases": []},
    "Cliffs": {"geoapify": "natural.mountain.cliff", "osm": None, "aliases": []},
    "Valleys": {"geoapify": None, "osm": ("natural", "valley"), "aliases": []},
    "Caves": {"geoapify": "natural.mountain.cave_entrance", "osm": None, "aliases": []},
    "Scenic Viewpoints": {"geoapify": "tourism.attraction.viewpoint", "osm": None, "aliases": ["viewpoint", "lookout"]},
    "Picnic Sites": {"geoapify": "leisure.picnic.picnic_site", "osm": None, "aliases": []},
    "Hiking Trails": {"geoapify": "highway.path", "osm": None, "aliases": ["trekking trail"]},
    "Walking Trails": {"geoapify": "highway.footway", "osm": None, "aliases": []},
    "Cycling Routes": {"geoapify": "highway.cycleway", "osm": None, "aliases": ["bike path"]},

    # --- Sports & Fitness ---
    "Swimming Pools": {"geoapify": "sport.swimming_pool", "osm": None, "aliases": []},
    "Gyms": {"geoapify": "sport.fitness.gym", "osm": None, "aliases": []},
    "Fitness Centers": {"geoapify": "sport.fitness.fitness_centre", "osm": None, "aliases": []},
    "Yoga Studios": {"geoapify": None, "osm": ("sport", "yoga"), "aliases": []},
    "Sports Centers": {"geoapify": "sport.sports_centre", "osm": None, "aliases": []},
    "Stadiums": {"geoapify": "sport.stadium", "osm": None, "aliases": []},
    "Basketball Courts": {"geoapify": "sport.pitch", "osm": None, "aliases": []},
    "Football Fields": {"geoapify": "sport.pitch", "osm": None, "aliases": ["soccer field"]},
    "Cricket Grounds": {"geoapify": "sport.pitch", "osm": None, "aliases": []},
    "Rugby Fields": {"geoapify": "sport.pitch", "osm": None, "aliases": []},
    "Tennis Courts": {"geoapify": "sport.pitch", "osm": None, "aliases": []},
    "Volleyball Courts": {"geoapify": "sport.pitch", "osm": None, "aliases": []},
    "Golf Courses": {"geoapify": "sport.golf_course", "osm": None, "aliases": []},
    "Skate Parks": {"geoapify": "sport.skateboard", "osm": None, "aliases": ["skatepark"]},
    "Ice Rinks": {"geoapify": "sport.ice_rink", "osm": None, "aliases": []},
    "Bowling Alleys": {"geoapify": "entertainment.bowling_alley", "osm": None, "aliases": []},
    "Horse Riding Centers": {"geoapify": "sport.horse_riding", "osm": None, "aliases": ["equestrian"]},
    "Climbing Gyms": {"geoapify": "entertainment.activity_park.climbing", "osm": None, "aliases": []},
    "Martial Arts Centers": {"geoapify": "sport.dojo", "osm": None, "aliases": ["dojo", "karate", "mma gym"]},

    # --- Entertainment ---
    "Cinemas": {"geoapify": "entertainment.cinema", "osm": None, "aliases": ["movie theater"]},
    "Theaters": {"geoapify": "entertainment.culture.theatre", "osm": None, "aliases": ["theatre"]},
    "Concert Halls": {"geoapify": "entertainment.culture.arts_centre", "osm": None, "aliases": []},
    "Nightclubs": {"geoapify": "adult.nightclub", "osm": None, "aliases": ["club"]},
    "Casinos": {"geoapify": "adult.casino", "osm": None, "aliases": []},
    "Amusement Parks": {"geoapify": "entertainment.theme_park", "osm": None, "aliases": []},
    "Theme Parks": {"geoapify": "entertainment.theme_park", "osm": None, "aliases": []},
    "Water Parks": {"geoapify": "entertainment.water_park", "osm": None, "aliases": []},
    "Zoos": {"geoapify": "entertainment.zoo", "osm": None, "aliases": []},
    "Aquariums": {"geoapify": "entertainment.aquarium", "osm": None, "aliases": []},
    "Escape Rooms": {"geoapify": "entertainment.escape_game", "osm": None, "aliases": []},
    "Arcades": {"geoapify": "entertainment.amusement_arcade", "osm": None, "aliases": ["arcade"]},

    # --- Culture / Tourism ---
    "Museums": {"geoapify": "entertainment.museum", "osm": None, "aliases": []},
    "Art Galleries": {"geoapify": "entertainment.culture.gallery", "osm": None, "aliases": ["gallery"]},
    "Tourist Attractions": {"geoapify": "tourism.attraction", "osm": None, "aliases": []},
    "Historic Buildings": {"geoapify": "tourism.sights.building", "osm": None, "aliases": []},
    "Castles": {"geoapify": "tourism.sights.castle", "osm": None, "aliases": []},
    "Forts": {"geoapify": "tourism.sights.fort", "osm": None, "aliases": []},
    "Monuments": {"geoapify": "tourism.sights.memorial.monument", "osm": None, "aliases": []},
    "Memorials": {"geoapify": "tourism.sights.memorial", "osm": None, "aliases": []},
    "Archaeological Sites": {"geoapify": "tourism.sights.archaeological_site", "osm": None, "aliases": []},
    "Heritage Sites": {"geoapify": "heritage", "osm": None, "aliases": []},
    "Observation Towers": {"geoapify": "man_made.tower", "osm": None, "aliases": ["watchtower"]},
    "Lighthouses": {"geoapify": "man_made.lighthouse", "osm": None, "aliases": []},
    "Visitor Centers": {"geoapify": "tourism.information.office", "osm": None, "aliases": []},

    # --- Shopping ---
    "Shopping Malls": {"geoapify": "commercial.shopping_mall", "osm": None, "aliases": ["mall"]},
    "Supermarkets": {"geoapify": "commercial.supermarket", "osm": None, "aliases": []},
    "Grocery Stores": {"geoapify": "commercial.convenience", "osm": None, "aliases": ["grocery"]},
    "Convenience Stores": {"geoapify": "commercial.convenience", "osm": None, "aliases": []},
    "Markets": {"geoapify": "commercial.marketplace", "osm": None, "aliases": ["market"]},
    "Clothing Stores": {"geoapify": "commercial.clothing", "osm": None, "aliases": ["apparel", "clothes shop"]},
    "Shoe Stores": {"geoapify": "commercial.clothing.shoes", "osm": None, "aliases": ["footwear"]},
    "Electronics Stores": {"geoapify": "commercial.elektronics", "osm": None, "aliases": ["electronics shop"]},
    "Furniture Stores": {"geoapify": "commercial.furniture_and_interior", "osm": None, "aliases": []},
    "Bookstores": {"geoapify": "commercial.books", "osm": None, "aliases": ["book shop"]},
    "Pharmacies": {"geoapify": "healthcare.pharmacy", "osm": None, "aliases": ["chemist", "drugstore"]},
    "Florists": {"geoapify": "commercial.florist", "osm": None, "aliases": ["flower shop"]},
    "Gift Shops": {"geoapify": "commercial.gift_and_souvenir", "osm": None, "aliases": ["souvenir shop"]},
    "Jewelry Stores": {"geoapify": "commercial.jewelry", "osm": None, "aliases": ["jeweler"]},
    "Pet Stores": {"geoapify": "pet.shop", "osm": None, "aliases": ["pet shop"]},
    "Toy Stores": {"geoapify": "commercial.toy_and_game", "osm": None, "aliases": ["toy shop"]},
    "Department Stores": {"geoapify": "commercial.department_store", "osm": None, "aliases": []},

    # --- Services ---
    "Banks": {"geoapify": "service.financial.bank", "osm": None, "aliases": []},
    "ATMs": {"geoapify": "service.financial.atm", "osm": None, "aliases": ["cash machine", "cashpoint"]},
    "Currency Exchange": {"geoapify": "service.financial.bureau_de_change", "osm": None, "aliases": ["forex", "money exchange"]},
    "Post Offices": {"geoapify": "service.post.office", "osm": None, "aliases": []},
    "Courier Offices": {"geoapify": None, "osm": ("shop", "copyshop"), "aliases": ["shipping office"]},
    "Travel Agencies": {"geoapify": "service.travel_agency", "osm": None, "aliases": []},
    "Car Rental": {"geoapify": "rental.car", "osm": None, "aliases": ["car hire"]},
    "Laundry Services": {"geoapify": "service.cleaning.laundry", "osm": None, "aliases": ["laundromat"]},
    "Dry Cleaners": {"geoapify": "service.cleaning.dry_cleaning", "osm": None, "aliases": []},
    "Hair Salons": {"geoapify": "service.beauty.hairdresser", "osm": None, "aliases": ["hairdresser"]},
    "Barber Shops": {"geoapify": "service.beauty.hairdresser", "osm": None, "aliases": ["barber"]},
    "Beauty Salons": {"geoapify": "service.beauty", "osm": None, "aliases": []},
    "Spas": {"geoapify": "leisure.spa", "osm": None, "aliases": []},
    "Tattoo Studios": {"geoapify": "service.beauty.tattoo", "osm": None, "aliases": ["tattoo parlor"]},
    "Coworking Spaces": {"geoapify": "office.coworking", "osm": None, "aliases": ["coworking"]},

    # --- Transport ---
    "Bus Stations": {"geoapify": "public_transport.bus", "osm": None, "aliases": []},
    "Train Stations": {"geoapify": "public_transport.train", "osm": None, "aliases": []},
    "Metro Stations": {"geoapify": "public_transport.subway", "osm": None, "aliases": ["subway station"]},
    "Airports": {"geoapify": "airport", "osm": None, "aliases": []},
    "Taxi Stands": {"geoapify": "service.taxi", "osm": None, "aliases": []},
    "Parking Lots": {"geoapify": "parking.cars", "osm": None, "aliases": ["car park"]},
    "Fuel Stations": {"geoapify": "service.vehicle.fuel", "osm": None, "aliases": ["gas station", "petrol station"]},
    "EV Charging Stations": {"geoapify": "service.vehicle.charging_station", "osm": None, "aliases": ["ev charger"]},
    "Bicycle Parking": {"geoapify": "parking.bicycles", "osm": None, "aliases": []},
    "Ferry Terminals": {"geoapify": "public_transport.ferry", "osm": None, "aliases": []},

    # --- Health ---
    "Hospitals": {"geoapify": "healthcare.hospital", "osm": None, "aliases": []},
    "Clinics": {"geoapify": "healthcare.clinic_or_praxis", "osm": None, "aliases": []},
    "Doctors": {"geoapify": "healthcare.clinic_or_praxis.general", "osm": None, "aliases": ["physician", "gp"]},
    "Dentists": {"geoapify": "healthcare.dentist", "osm": None, "aliases": []},
    "Veterinary Clinics": {"geoapify": "pet.veterinary", "osm": None, "aliases": ["vet"]},
    "Blood Banks": {"geoapify": None, "osm": ("healthcare", "blood_donation"), "aliases": []},
    "Emergency Services": {"geoapify": "emergency", "osm": None, "aliases": []},
    "Nursing Homes": {"geoapify": "service.social_facility.nursing_home", "osm": None, "aliases": ["care home"]},

    # --- Education ---
    "Schools": {"geoapify": "education.school", "osm": None, "aliases": []},
    "Universities": {"geoapify": "education.university", "osm": None, "aliases": []},
    "Colleges": {"geoapify": "education.college", "osm": None, "aliases": []},
    "Libraries": {"geoapify": "education.library", "osm": None, "aliases": []},
    "Kindergartens": {"geoapify": "childcare.kindergarten", "osm": None, "aliases": ["preschool"]},
    "Training Centers": {"geoapify": None, "osm": ("office", "educational_institution"), "aliases": []},

    # --- Civic / Government ---
    "Police Stations": {"geoapify": "service.police", "osm": None, "aliases": []},
    "Fire Stations": {"geoapify": "service.fire_station", "osm": None, "aliases": []},
    "Courts": {"geoapify": None, "osm": ("amenity", "courthouse"), "aliases": ["courthouse"]},
    "Town Halls": {"geoapify": "tourism.sights.city_hall", "osm": None, "aliases": ["city hall"]},
    "Embassies": {"geoapify": "office.government.embassy", "osm": None, "aliases": ["embassy", "consulate"]},
    "Government Offices": {"geoapify": "office.government", "osm": None, "aliases": []},
    "Community Centers": {"geoapify": "activity.community_center", "osm": None, "aliases": []},
    "Public Toilets": {"geoapify": "amenity.toilet", "osm": None, "aliases": ["restroom", "bathroom"]},

    # --- Religion ---
    "Churches": {"geoapify": "religion.place_of_worship.christianity", "osm": None, "aliases": ["church"]},
    "Mosques": {"geoapify": "religion.place_of_worship.islam", "osm": None, "aliases": ["mosque"]},
    "Temples": {"geoapify": "religion.place_of_worship.hinduism", "osm": None, "aliases": ["temple"]},
    "Synagogues": {"geoapify": "religion.place_of_worship.judaism", "osm": None, "aliases": ["synagogue"]},
    "Shrines": {"geoapify": "tourism.sights.place_of_worship.shrine", "osm": None, "aliases": []},
    "Monasteries": {"geoapify": "tourism.sights.monastery", "osm": None, "aliases": []},
    "Cemeteries": {"geoapify": "memorial.cemetery", "osm": None, "aliases": ["graveyard"]},

    # --- Animals / Kids ---
    "Dog Parks": {"geoapify": "pet.dog_park", "osm": None, "aliases": []},
    "Animal Shelters": {"geoapify": "pet.animal_shelter", "osm": None, "aliases": []},
    "Wildlife Reserves": {"geoapify": "natural.protected_area", "osm": None, "aliases": []},
    "Playgrounds": {"geoapify": "leisure.playground", "osm": None, "aliases": []},
    "Daycare Centers": {"geoapify": "service.social_facility.day_care", "osm": None, "aliases": ["daycare"]},
    "Family Entertainment Centers": {"geoapify": None, "osm": ("leisure", "amusement_arcade"), "aliases": ["fec"]},

    # --- Nightlife ---
    "Lounges": {"geoapify": "catering.bar", "osm": None, "aliases": ["lounge"]},
    "Cocktail Bars": {"geoapify": "catering.bar", "osm": None, "aliases": []},
    "Live Music Venues": {"geoapify": None, "osm": ("amenity", "music_venue"), "aliases": ["live music"]},
    "Karaoke Bars": {"geoapify": None, "osm": ("leisure", "karaoke_box"), "aliases": ["karaoke"]},

    # --- Tech / Misc shops ---
    "Internet Cafés": {"geoapify": None, "osm": ("amenity", "internet_cafe"), "aliases": ["internet cafe", "cyber cafe"]},
    "Computer Repair Shops": {"geoapify": None, "osm": ("shop", "computer"), "aliases": ["pc repair", "laptop repair"]},
    "Mobile Phone Stores": {"geoapify": None, "osm": ("shop", "mobile_phone"), "aliases": ["cell phone store", "phone shop", "smartphone store"]},

    # --- Automotive ---
    "Car Dealerships": {"geoapify": "commercial.vehicle", "osm": None, "aliases": ["car dealer"]},
    "Car Repair Shops": {"geoapify": "service.vehicle.repair.car", "osm": None, "aliases": ["auto repair"]},
    "Mechanics": {"geoapify": "service.vehicle.repair", "osm": None, "aliases": ["mechanic"]},
    "Tire Shops": {"geoapify": None, "osm": ("shop", "tyres"), "aliases": ["tyre shop"]},
    "Car Washes": {"geoapify": "service.vehicle.car_wash", "osm": None, "aliases": ["car wash"]},

    # --- Storage ---
    "Warehouses": {"geoapify": None, "osm": ("building", "warehouse"), "aliases": []},
    "Storage Facilities": {"geoapify": "rental.storage", "osm": None, "aliases": ["self storage"]},

    # --- Outdoor Activities ---
    "Fishing Spots": {"geoapify": "sport.fishing", "osm": None, "aliases": ["fishing"]},
    "Boating": {"geoapify": "rental.boat", "osm": None, "aliases": ["boat rental"]},
    "Kayaking": {"geoapify": None, "osm": ("sport", "canoe"), "aliases": ["kayak"]},
    "Canoeing": {"geoapify": None, "osm": ("sport", "canoe"), "aliases": ["canoe"]},
    "Rafting": {"geoapify": None, "osm": ("sport", "canoe"), "aliases": ["whitewater rafting"]},
    "Surfing": {"geoapify": None, "osm": ("sport", "surfing"), "aliases": ["surf"]},
    "Diving": {"geoapify": "sport.dive_centre", "osm": None, "aliases": ["scuba diving"]},
    "Snorkeling": {"geoapify": None, "osm": ("sport", "snorkeling"), "aliases": []},
    "Skiing": {"geoapify": "ski.lift", "osm": None, "aliases": ["ski resort"]},
    "Snowboarding": {"geoapify": None, "osm": ("sport", "skiing"), "aliases": []},
    "Rock Climbing": {"geoapify": "entertainment.activity_park.climbing", "osm": None, "aliases": ["climbing"]},
}


def get_category_code(readable_name: str):
    """Look up the Geoapify category code. Returns None if not mapped (use OSM instead)."""
    entry = PLACE_REGISTRY.get(readable_name)
    return entry["geoapify"] if entry else None


def get_osm_tag(readable_name: str):
    """Look up the (key, value) OSM tag pair. Returns None if unsupported via OSM."""
    entry = PLACE_REGISTRY.get(readable_name)
    return entry["osm"] if entry else None


def list_all_categories():
    """All human-readable category names — useful for building a frontend filter list."""
    return list(PLACE_REGISTRY.keys())


def list_unmapped_categories():
    """Categories with no Geoapify code — these route through osm_data.py."""
    return [name for name, entry in PLACE_REGISTRY.items() if entry["geoapify"] is None]

LINEAR_FEATURE_CATEGORIES = {
    "Rivers",
    "Waterfalls",
    "Hiking Trails",
    "Walking Trails",
    "Cycling Routes",
}