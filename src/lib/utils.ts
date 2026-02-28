import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function removeUndefined(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
    } else if (obj !== null && typeof obj === "object") {
        return Object.entries(obj).reduce((acc: any, [key, value]) => {
            if (value !== undefined) {
                acc[key] = removeUndefined(value);
            }
            return acc;
        }, {});
    }
    return obj;
}
