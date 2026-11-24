import {
  formatCoupleFullNames,
  formatCoupleInitials,
  formatCoupleNames,
  formatWeddingTime,
} from '~/app/utils/helpers'

describe('wedding display preferences', () => {
  const wedding = {
    brideFirstName: 'Alice',
    brideLastName: 'Smith',
    groomFirstName: 'John',
    groomLastName: 'Doe',
  }

  it('defaults couple names to bride-first order', () => {
    expect(formatCoupleNames(wedding)).toBe('Alice & John')
    expect(formatCoupleFullNames(wedding)).toEqual(['Alice Smith', 'John Doe'])
    expect(formatCoupleInitials(wedding)).toBe('A & J')
  })

  it('uses groom-first order when selected', () => {
    const groomFirst = { ...wedding, nameOrder: 'GROOM_FIRST' as const }
    expect(formatCoupleNames(groomFirst)).toBe('John & Alice')
    expect(formatCoupleFullNames(groomFirst)).toEqual(['John Doe', 'Alice Smith'])
    expect(formatCoupleInitials(groomFirst)).toBe('J & A')
  })

  it('formats 24-hour times as 12-hour times', () => {
    expect(formatWeddingTime('00:00', 'TWELVE_HOUR')).toBe('12:00 AM')
    expect(formatWeddingTime('12:00', 'TWELVE_HOUR')).toBe('12:00 PM')
    expect(formatWeddingTime('12:30', 'TWELVE_HOUR')).toBe('12:30 PM')
    expect(formatWeddingTime('14:05', 'TWELVE_HOUR')).toBe('2:05 PM')
    expect(formatWeddingTime('14:05', 'TWENTY_FOUR_HOUR')).toBe('14:05')
    expect(formatWeddingTime('14:05')).toBe('14:05')
  })

  it('formats existing 12-hour event times as 24-hour times', () => {
    expect(formatWeddingTime('12:00 AM', 'TWENTY_FOUR_HOUR')).toBe('00:00')
    expect(formatWeddingTime('12:00 PM', 'TWENTY_FOUR_HOUR')).toBe('12:00')
    expect(formatWeddingTime('1:00 PM', 'TWENTY_FOUR_HOUR')).toBe('13:00')
    expect(formatWeddingTime('7:30 PM', 'TWENTY_FOUR_HOUR')).toBe('19:30')
  })

  it('preserves times that are already in the requested format', () => {
    expect(formatWeddingTime('7:30 PM', 'TWELVE_HOUR')).toBe('7:30 PM')
    expect(formatWeddingTime('07:30', 'TWENTY_FOUR_HOUR')).toBe('07:30')
  })
})
