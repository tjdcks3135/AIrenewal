/** 조건부 className 결합. falsy 값은 버린다. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
