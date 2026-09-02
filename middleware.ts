import { NextRequest, NextResponse } from "next/server";

// 첫 진입 게이트: 주소창·북마크·바깥 링크로 이 사이트를 새로 열면 어떤 주소든
// 무조건 01_스플래시부터 보여준다. 앱을 켜면 늘 첫 화면이 뜨는 것과 같다.
// 사이트 안에서 눌러 넘어가는 것(같은 출처)은 그대로 통과시킨다.
function isSiteEntry(request: NextRequest): boolean {
  const mode = request.headers.get("sec-fetch-mode");
  if (mode) {
    // 요즘 브라우저 — 문서를 새로 여는 이동인데 우리 사이트에서 온 게 아니면 첫 진입
    return mode === "navigate" && request.headers.get("sec-fetch-site") !== "same-origin";
  }

  // Sec-Fetch-* 를 안 보내는 예전 브라우저 대비.
  // 화면(HTML)을 달라는 요청만 따진다 — 데이터 요청은 게이트 대상이 아니다.
  if (!(request.headers.get("accept") ?? "").includes("text/html")) return false;
  const referer = request.headers.get("referer");
  if (!referer) return true;
  try {
    return new URL(referer).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/splash") return NextResponse.next();

  if (isSiteEntry(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/splash";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // API·정적 파일·프리페치 리소스는 게이트 대상이 아니다.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
