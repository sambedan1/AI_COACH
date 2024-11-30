
import { atom } from "jotai";
interface UserThreadType {
    ThreadId: string,
    UserId:string,
    date:string
    // Add other properties if they exist
  }

export const userthreadatom = atom<UserThreadType | null>(null)
export const assistantatom = atom<string | undefined>(undefined)