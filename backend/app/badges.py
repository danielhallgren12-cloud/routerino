BADGES = {
    "milestone": [
        {"id": "first_trace", "name": "First Steps", "desc": "Complete your first trace", "icon": "🎯", "req": ("traces", 1)},
        {"id": "traces_10", "name": "Getting Started", "desc": "Complete 10 traces", "icon": "👣", "req": ("traces", 10)},
        {"id": "traces_25", "name": "Regular", "desc": "Complete 25 traces", "icon": "📊", "req": ("traces", 25)},
        {"id": "traces_50", "name": "Committed", "desc": "Complete 50 traces", "icon": "🔥", "req": ("traces", 50)},
        {"id": "traces_100", "name": "Route Master", "desc": "Complete 100 traces", "icon": "👑", "req": ("traces", 100)},
        {"id": "traces_500", "name": "Legend", "desc": "Complete 500 traces", "icon": "🌟", "req": ("traces", 500)},
    ],
    "discovery": [
        {"id": "first_country", "name": "World Traveler", "desc": "Reach your first country", "icon": "🌍", "req": ("countries", 1)},
        {"id": "countries_5", "name": "Globetrotter", "desc": "Visit 5 countries", "icon": "✈️", "req": ("countries", 5)},
        {"id": "countries_10", "name": "Explorer", "desc": "Visit 10 countries", "icon": "🧭", "req": ("countries", 10)},
        {"id": "countries_25", "name": "Jet Setter", "desc": "Visit 25 countries", "icon": "🗺️", "req": ("countries", 25)},
        {"id": "first_city", "name": "Local", "desc": "Reach your first city", "icon": "📍", "req": ("cities", 1)},
        {"id": "cities_10", "name": "Urban Explorer", "desc": "Visit 10 cities", "icon": "🏙️", "req": ("cities", 10)},
        {"id": "cities_50", "name": "Metropolis", "desc": "Visit 50 cities", "icon": "🌆", "req": ("cities", 50)},
        {"id": "first_destination", "name": "First Search", "desc": "Complete your first trace", "icon": "🔍", "req": ("destinations", 1)},
        {"id": "destinations_10", "name": "Regular Searcher", "desc": "Trace to 10 destinations", "icon": "🔎", "req": ("destinations", 10)},
        {"id": "first_isp", "name": "Network Newbie", "desc": "Encounter your first ISP", "icon": "📡", "req": ("companies", 1)},
        {"id": "isps_5", "name": "ISP Hunter", "desc": "Encounter 5 ISPs", "icon": "📶", "req": ("companies", 5)},
    ],
    "streak": [
        {"id": "streak_3", "name": "Consistent", "desc": "Trace 3 days in a row", "icon": "🔥", "req": ("streak", 3)},
        {"id": "streak_7", "name": "Dedicated", "desc": "Trace 7 days in a row", "icon": "💪", "req": ("streak", 7)},
        {"id": "streak_14", "name": "Two Weeks", "desc": "Trace 14 days in a row", "icon": "⭐", "req": ("streak", 14)},
        {"id": "streak_30", "name": "Month Master", "desc": "Trace 30 days in a row", "icon": "🏆", "req": ("streak", 30)},
    ],
    "art": [
        {"id": "first_art", "name": "Artist", "desc": "Export your first art", "icon": "🎨", "req": ("exports", 1)},
        {"id": "art_10", "name": "Creative", "desc": "Export 10 artworks", "icon": "🖼️", "req": ("exports", 10)},
    ],
    "first_discovery": [
        {"id": "first_discovery_1", "name": "First Footsteps", "desc": "Make your first world first discovery", "icon": "🌍", "req": ("first_discoveries", 1)},
        {"id": "first_discovery_10", "name": "Pathfinder", "desc": "Make 10 world first discoveries", "icon": "🗺️", "req": ("first_discoveries", 10)},
        {"id": "first_discovery_25", "name": "Trailblazer", "desc": "Make 25 world first discoveries", "icon": "🌐", "req": ("first_discoveries", 25)},
        {"id": "first_discovery_50", "name": "Pioneer", "desc": "Make 50 world first discoveries", "icon": "🏔️", "req": ("first_discoveries", 50)},
        {"id": "first_discovery_100", "name": "Legend", "desc": "Make 100 world first discoveries", "icon": "🚀", "req": ("first_discoveries", 100)},
    ],
}

def get_all_badges():
    all_badges = []
    for category, badges in BADGES.items():
        for badge in badges:
            badge["category"] = category
            all_badges.append(badge)
    return all_badges

def get_badge_by_id(badge_id):
    for category, badges in BADGES.items():
        for badge in badges:
            if badge["id"] == badge_id:
                return badge
    return None