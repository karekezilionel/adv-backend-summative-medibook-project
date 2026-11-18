const { calculateRefund } = require('../src/services/refund');
const { isValidSlot } = require('../src/services/validation');

describe('Refund Calculator Business Rules', () => {
    const appointmentTime = new Date('2026-12-31T10:00:00Z');
    const amountPaid = 100;

    test('Tier 1: More than 48 hours notice gets 100% refund', () => {
        const cancelTime = new Date('2026-12-29T09:59:00Z');
        const result = calculateRefund(amountPaid, appointmentTime, cancelTime);
        expect(result.percentage).toBe(100);
        expect(result.amount).toBe(100);
    });

    test('Tier 2: Exactly 48 hours notice gets 50% refund (Boundary)', () => {
        const cancelTime = new Date('2026-12-29T10:00:00Z');
        const result = calculateRefund(amountPaid, appointmentTime, cancelTime);
        expect(result.percentage).toBe(50);
        expect(result.amount).toBe(50);
    });

    test('Tier 3: Between 24 and 48 hours notice gets 50% refund', () => {
        const cancelTime = new Date('2026-12-30T10:00:00Z');
        const result = calculateRefund(amountPaid, appointmentTime, cancelTime);
        expect(result.percentage).toBe(50);
        expect(result.amount).toBe(50);
    });

    test('Tier 4: Exactly 24 hours notice gets 50% refund (Boundary)', () => {
        const cancelTime = new Date('2026-12-30T10:00:00Z');
        const result = calculateRefund(amountPaid, appointmentTime, cancelTime);
        expect(result.percentage).toBe(50);
        expect(result.amount).toBe(50);
    });

    test('Tier 5: Less than 24 hours notice gets 0% refund', () => {
        const cancelTime = new Date('2026-12-30T10:01:00Z');
        const result = calculateRefund(amountPaid, appointmentTime, cancelTime);
        expect(result.percentage).toBe(0);
        expect(result.amount).toBe(0);
    });
});

describe('Slot Validation Business Rules', () => {
    test('Should reject appointments in the past', () => {
        const result = isValidSlot('2020-01-01T10:00:00');
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/future/i);
    });

    test('Should reject appointments outside working hours (08:00)', () => {
        const result = isValidSlot('2030-01-01T08:00:00');
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/working hours/i);
    });

    test('Should reject appointments not on 30-minute boundaries (09:15)', () => {
        const result = isValidSlot('2030-01-01T09:15:00');
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/30-minute boundary/i);
    });

    test('Should accept a valid future appointment on a 30-minute boundary', () => {
        const result = isValidSlot('2030-01-01T09:30:00');
        expect(result.valid).toBe(true);
    });
});