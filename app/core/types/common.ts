export type TIconProps = {
  color?: string;
  size?: number;
};

export type TServiceResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};
