// app/api/places/search/route.ts
//
// Secure server-side Google Places (New) search for LeadGrid / OmniFollowUp.
// The API key lives in an env var and NEVER reaches the browser.
//
// .env.local:
//   GOOGLE_PLACES_API_KEY=your_key_here
//
// Client usage (replace the prototype's searchPlaces() fetch with this):
//   const r = await fetch('/api/places/search', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ category: 'Nail Salon', area: 'Mississauga, ON', noWebsite: true }),
//   });
//   const { businesses } = await r.json();

import { NextRequest, NextResponse } from 'next/server';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.types',
].join(',');

type PlaceComponent = { types: string[]; longText?: string; shortText?: string };
type Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: PlaceComponent[];
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
};

function comp(p: Place, type: string): string {
  const c = (p.addressComponents ?? []).find((x) => x.types?.includes(type));
  return c ? c.shortText ?? c.longText ?? '' : '';
}

// Simple, tunable lead score — mirror this with the version in your app.
function scoreFor(b: {
  website: boolean;
  reviewCount: number;
  rating: number;
}): number {
  let s = 42;
  if (!b.website) s += 25;
  s += Math.min(b.reviewCount / 20, 15);
  s += b.rating >= 3.6 && b.rating <= 4.6 ? 10 : b.rating > 4.6 ? 4 : 0;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function toBusiness(p: Place, category: string) {
  const loc = p.location ?? {};
  const num = comp(p, 'street_number');
  const route = comp(p, 'route');
  const street = (num ? num + ' ' : '') + route || (p.formattedAddress ?? '').split(',')[0];
  const website = Boolean(p.websiteUri);
  const rating = p.rating ?? 0;
  const reviewCount = p.userRatingCount ?? 0;

  return {
    placeId: p.id ?? null,
    name: p.displayName?.text ?? 'Unknown business',
    category,
    city:
      comp(p, 'locality') ||
      comp(p, 'sublocality') ||
      comp(p, 'administrative_area_level_2') ||
      '',
    province: comp(p, 'administrative_area_level_1') || 'ON',
    postal: comp(p, 'postal_code') || '',
    street,
    address: p.formattedAddress ?? '',
    lat: loc.latitude ?? null,
    lng: loc.longitude ?? null,
    phone: p.nationalPhoneNumber ?? '',
    website,
    web: p.websiteUri ?? null,
    rating,
    reviewCount,
    // Places does NOT return these — fill them in a later enrichment step
    // (scrape the business's site / directories, or an enrichment API):
    email: null as string | null,
    socials: {
      instagram: null,
      facebook: null,
      google: p.googleMapsUri ? 'Google Business Profile' : null,
    },
    reviews: [] as unknown[], // hydrate via Place Details (returns up to 5)
    score: scoreFor({ website, reviewCount, rating }),
  };
}

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Missing GOOGLE_PLACES_API_KEY' }, { status: 500 });
  }

  let body: { category?: string; area?: string; noWebsite?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const category = (body.category ?? '').trim();
  const area = (body.area ?? '').trim();
  if (!category || !area) {
    return NextResponse.json({ error: 'category and area are required' }, { status: 400 });
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: `${category} in ${area}`,
        maxResultCount: 20,
        regionCode: 'CA',
      }),
      // Places results are stable enough to cache briefly and save on billing:
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? `Places API ${res.status}` },
        { status: res.status },
      );
    }

    const data: { places?: Place[] } = await res.json();
    let businesses = (data.places ?? [])
      .map((p) => toBusiness(p, category))
      .filter((b) => b.lat != null && b.lng != null);

    if (body.noWebsite) businesses = businesses.filter((b) => !b.website);

    return NextResponse.json({ businesses });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Places request failed' },
      { status: 502 },
    );
  }
}
