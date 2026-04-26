import { KelloTime, GET_TIMES } from "./globals";

/** Valid random kello is not included in the official kello times, and is also further than a minute away from one. */
export function isValidRandomKello(kello: KelloTime): boolean {
    if (kello.hour === 0 && kello.minute === 0) { return false; }
    return GET_TIMES.every(
        time => time.hour !== kello.hour
        || Math.abs(time.minute - kello.minute) > 1
    );
}

export function addLeadingZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
}

export function getOpenCriticDissMessage(score: number): string {
    if (score === -1) {
        // Apparently "-1" means no reviews.
        return 'Aika huono ei ees arvosteluja';
    }

    const rnd = Math.random();
    const witcherinoScore = 93;

    if (rnd < 0.02 && score < witcherinoScore) {
        return 'Witcher 3 on parempi';
    }

    if (rnd < 0.05) {
        return `Quite bad not even ${score + 1}`;
    }

    return `Aika huono ei ees ${score + 1}`;
}