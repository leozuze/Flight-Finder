from rapidfuzz import fuzz, process
from src.places.place_categories import PLACE_REGISTRY


def _normalize(text: str) -> str:
    return text.strip().lower().rstrip("s")


def resolve_category(user_input: str, limit: int = 5, score_cutoff: int = 60, relative_margin: int = 20):
    """
    Resolve free-text user input (e.g. "mobile phone", "store", "courts")
    to one or more known PLACE_REGISTRY category names.

    Returns a list of (category_name, confidence_0_to_100) tuples, best first.
    Empty list means genuinely nothing matched.

    Tiers, in order — first tier with any hits wins:
      1. Exact match on the category name itself
      2. Exact match on an alias
      3. Substring match (query inside name/alias, or name/alias inside query)
      4. Fuzzy match across all names + aliases (typos, loose synonyms)

    FIX: tier 4 used to keep every candidate that cleared the flat
    `score_cutoff`, with no regard for how far behind the best match it
    was. rapidfuzz's WRatio blends several string-similarity metrics
    (including partial_ratio), which can hand a short, unrelated category
    name a score like 61-65 purely by chance overlap of a few characters —
    e.g. "restaurent" (a typo of "restaurant") scoring high on
    "Restaurants" but ALSO clearing 60 against "Forests" or "Arcades",
    which then rode along as equally "matched" categories even though
    they're nowhere close to what the person meant. `relative_margin`
    discards anything more than that many points behind the top score, so
    a single strong match stays a single strong match instead of getting
    diluted by fuzzy-scoring noise.
    """
    q = _normalize(user_input)
    if not q:
        return []

    # Tier 1: exact category name
    for name in PLACE_REGISTRY:
        if _normalize(name) == q:
            return [(name, 100)]

    # Tier 2: exact alias
    for name, info in PLACE_REGISTRY.items():
        if q in [_normalize(a) for a in info["aliases"]]:
            return [(name, 100)]

    # Tier 3: substring, either direction — this is what makes generic terms
    # like "shop" or "store" return a *list* of matching categories instead of nothing
    substring_hits = []
    for name, info in PLACE_REGISTRY.items():
        haystacks = [_normalize(name)] + [_normalize(a) for a in info["aliases"]]
        if any(q in h or h in q for h in haystacks):
            substring_hits.append((name, 95))
    if substring_hits:
        return substring_hits[:limit]

    # Tier 4: fuzzy fallback for typos / loose synonyms rapidfuzz can catch
    choices = {}
    for name, info in PLACE_REGISTRY.items():
        choices[name] = name
        for alias in info["aliases"]:
            choices[alias] = name  # alias text maps back to its real category

    matches = process.extract(q, choices.keys(), scorer=fuzz.WRatio, limit=limit * 3)
    if not matches:
        return []

    top_score = matches[0][1]

    seen = set()
    fuzzy_hits = []
    for matched_text, score, _ in matches:
        if score < score_cutoff:
            continue
        if score < top_score - relative_margin:
            continue
        category = choices[matched_text]
        if category not in seen:
            seen.add(category)
            fuzzy_hits.append((category, round(score)))
        if len(fuzzy_hits) >= limit:
            break

    return fuzzy_hits