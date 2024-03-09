import { writable } from 'svelte/store';

export const filesBase64 = writable([]);
export const userPrompt = writable("What's in this image?")
export const busy = writable(false);
export const apiKey = writable("");