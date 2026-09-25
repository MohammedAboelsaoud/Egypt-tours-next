/**
 * Hotels store their official rate. Travellers see and pay that rate plus the
 * markup set in Admin → Settings (10% unless changed).
 */
export const DEFAULT_HOTEL_MARKUP_PERCENT = 10

/** The traveller's price: the official rate plus the markup, to the nearest whole unit. */
export function applyMarkup(officialRate: number, markupPercent: number): number {
  return Math.round(officialRate * (1 + markupPercent / 100))
}

/** The official rate behind a traveller's price — used to filter by price in the database. */
export function removeMarkup(price: number, markupPercent: number): number {
  return price / (1 + markupPercent / 100)
}
