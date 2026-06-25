export class Result<T = void> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string,
  ) {}

  static ok<U = void>(value?: U): Result<U> {
    return new Result(true, value);
  }

  static fail<U = void>(error: string): Result<U> {
    return new Result(false, undefined, error) as any;
  }

  getValueOrThrow(): T {
    if (!this.isSuccess) throw new Error(this.error);
    return this.value as T;
  }
}
