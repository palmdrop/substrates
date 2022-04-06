/* eslint-disable @typescript-eslint/no-explicit-any */
// Kudos to https://stackoverflow.com/a/57103940
type DistributiveOmit<T, K extends keyof any> =
  T extends any
    ? Omit<T, K>
    : never;