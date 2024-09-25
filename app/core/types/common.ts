export type TScreen = {
  name: string;
};

export type TIconProps = {
  color?: string;
  size?: number;
  opacity?: number;
};

export type TStrokeIconProps = TIconProps & {
  strokeWidth?: number;
};

export type TResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};
