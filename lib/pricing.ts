// Server-side pricing — never trust a price the client sends. Every route
// that creates a booking must recompute the total from the Boat row itself.
export const DEPOSIT_RATE = 0.2;

export interface BoatPriceInput {
  priceHalfDay: number;
  priceFullDay: number;
  skipperHalfDay: number;
  skipperFullDay: number;
}

export interface BookingPrice {
  boatPrice: number;
  skipperPrice: number;
  totalPrice: number;
  depositPaid: number;
  remainingAmount: number;
}

export function computeBookingPrice(
  boat: BoatPriceInput,
  period: 'HALF_DAY' | 'FULL_DAY',
  withSkipper: boolean
): BookingPrice {
  const boatPrice = period === 'HALF_DAY' ? boat.priceHalfDay : boat.priceFullDay;
  const skipperPrice = withSkipper
    ? period === 'HALF_DAY'
      ? boat.skipperHalfDay
      : boat.skipperFullDay
    : 0;

  const totalPrice = boatPrice + skipperPrice;
  const depositPaid = Math.round(totalPrice * DEPOSIT_RATE * 100) / 100;
  const remainingAmount = Math.round((totalPrice - depositPaid) * 100) / 100;

  return { boatPrice, skipperPrice, totalPrice, depositPaid, remainingAmount };
}
