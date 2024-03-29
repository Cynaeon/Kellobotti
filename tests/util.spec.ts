import { GET_TIMES } from '../src/globals';
import { isValidRandomKello } from '../src/util';
import { it, expect, describe } from '@jest/globals';


describe('isValidRandomKello', () => {
    it('should return true if hour is not a match', () => {
        expect(isValidRandomKello({ name: 'Bonus', hour: 5, minute: 37 })).toBe(true);
        expect(isValidRandomKello({ name: 'Bonus', hour: 10, minute: 11 })).toBe(true);
        expect(isValidRandomKello({ name: 'Bonus', hour: 20, minute: 7 })).toBe(true);
    });

    it('should return false when time is equal to a get time', () => {
        expect(isValidRandomKello({ name: 'some', hour: 11, minute: 11 })).toBe(false);
        expect(isValidRandomKello({ name: 'some', hour: GET_TIMES[0].hour, minute: GET_TIMES[0].minute })).toBe(false);
    });

    it('should return false when time is a minute before a get time', () => {
        expect(isValidRandomKello({ name: 'some', hour: 13, minute: 36 })).toBe(false);
        expect(isValidRandomKello({ name: 'some', hour: GET_TIMES[0].hour, minute: GET_TIMES[0].minute - 1 })).toBe(false);
    });

    it('should return false when time is a minute after a get time', () => {
        expect(isValidRandomKello({ name: 'some', hour: GET_TIMES[0].hour, minute: GET_TIMES[0].minute + 1 })).toBe(false);
    });

    it('should return true when time is a 2 minutes before a get time', () => {
        expect(isValidRandomKello({ name: 'some', hour: GET_TIMES[0].hour, minute: GET_TIMES[0].minute - 2 })).toBe(true);
    });

    it('should return true when time is a 2 minutes after a get time', () => {
        expect(isValidRandomKello({ name: 'some', hour: GET_TIMES[0].hour, minute: GET_TIMES[0].minute + 2 })).toBe(true);
    });
});
