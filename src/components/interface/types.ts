/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseField, Field } from '../../interface/types/nodes';

export type ChangeCallback<
  F extends BaseField<any> = Field<number>
> = (
  value: any, 
  field: F
)=> void;