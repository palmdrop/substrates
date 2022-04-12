/* eslint-disable @typescript-eslint/no-explicit-any */
// Kudos to https://stackoverflow.com/a/57103940
export type DistributiveOmit<T, K extends keyof any> =
  T extends any
    ? Omit<T, K>
    : never;

// Kudos to https://stackoverflow.com/a/50375286
export type UnionToIntersection<U> = 
  (U extends any 
    ? (k: U) => void 
    : never) extends ((k: infer I) => void) 
    ? I 
    : never