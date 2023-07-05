import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

export function isGreaterThanThreeDaysAgo(timestamp: number) {
    const now: number = Number(new Date());
    const pastDate = new Date(timestamp * 1);
    const timeDiffInMs: number = now - timestamp;
    const timeDiffInDays = timeDiffInMs / (1000 * 60 * 60 * 24);
    return timeDiffInDays > 3;
}
// Create formatter (English).
TimeAgo.addDefaultLocale(en)

export const TimeAgoAgo = new TimeAgo('en-US')
