import { NextRequest, NextResponse } from "next/server";

// 첫 진입 게이트: 어떤 주소로 들어와도 이 브라우저 세션에서 아직 01_스플래시를
// 거치지 않았다면 /splash 로 보낸다. /splash 방문 시 세션 쿠키를 심어 이후
// 01→02→03 순서대로 자유롭게 이동할 수 있다. (세션 쿠키라 브라우저를 새로 열면
// 앱 실행처럼 다시 스플래시부터 시작한다.)
const ENTRY_COOKIE = "dn_entered";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/splash") {
    const res = NextResponse.next();
    res.cookies.set(ENTRY_COOKIE, "1", { path: "/", sameSite: "lax" });
    return res;
  }

  if (!request.cookies.has(ENTRY_COOKIE)) {
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
