export type TIconProps = {
  color?: string;
  size?: number;
  opacity?: number;
};

export type TStrokeIconProps = TIconProps & {
  strokeWidth?: number;
};

export type TServiceResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};
