// ponytail: ?from=/?next= 값을 검증 없이 Link href에 쓰면 오픈 리다이렉트가 된다.
// 문자열 접두사 검사(startsWith("//"))는 백슬래시/탭/개행처럼 브라우저가 URL을 파싱할 때
// 정규화·제거되는 문자로 우회된다(/\evil.com, /%09/evil.com 등이 실제로 //evil.com으로 풀림) —
// 검증된 사례. 대신 브라우저와 같은 WHATWG URL 파서로 실제 resolve한 origin을 비교한다.
const INTERNAL_BASE = "http://internal.invalid";

export function safeInternalPath(value: string | string[] | undefined, fallback: string): string {
  if (typeof value !== "string" || value === "" || !value.startsWith("/")) return fallback;
  let resolved: URL;
  try {
    resolved = new URL(value, INTERNAL_BASE);
  } catch {
    return fallback;
  }
  if (resolved.origin !== INTERNAL_BASE) return fallback;
  return value;
}
