import { KelloTime, GET_TIMES } from "./globals";

/** Valid random kello is not included in the official kello times, and is also further than a minute away from one. */
export function isValidRandomKello(kello: KelloTime): boolean {
    return GET_TIMES.every(
        time => time.hour !== kello.hour
        || Math.abs(time.minute - kello.minute) > 1
    );
}