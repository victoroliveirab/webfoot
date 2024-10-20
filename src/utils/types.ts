import type { Accessor } from "solid-js";

export type ContextPending<T, Q extends keyof T = keyof T> = {
  [K in Q]: null;
} & { ready: false };

export type ContextResolved<T, Q extends keyof T = keyof T> = {
  [K in Q]: T[K];
} & { ready: true };

export type Context<T, Q extends keyof T = keyof T> = Accessor<
  ContextPending<T, Q> | ContextResolved<T, Q>
>;

export type ArrayOfField<WrapperType, Field extends keyof any> = {
  [K in keyof WrapperType]: WrapperType[K] extends Array<infer Element>
    ? Element extends { [K in Field]: unknown }
      ? Element[Field][]
      : never
    : never;
};

export type HashMap<T extends { id: number }> = Record<T["id"], T>;
export type PatchObject<T extends { id: number }> = Partial<T> & { id: number };
