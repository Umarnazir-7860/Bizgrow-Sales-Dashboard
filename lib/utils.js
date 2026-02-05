import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Ye raha hamara smart function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}