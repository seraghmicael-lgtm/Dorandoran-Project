"use client";

import Link from "next/link";

// UI디자인 ds_navigation_bottom — 홈 · 내 동행 · 내 정보 · 만들기.
// 만들기만 초록 ⊕ 로 도드라진다(이 앱에서 하는 유일한 "만드는" 일이라서).
interface BottomNavFiveProps {
  active?: "home" | "my-meetups" | "my-info" | "create";
}

// UI디자인 아이콘 public/icon/fill_* — SVG 파일이 fill="#171717"로 고정돼 있어
// 선택/비선택 색을 살리려고 MicIcon처럼 path만 그대로 옮겨 담았다.
function Icon({ name, active }: { name: string; active: boolean }) {
  // select=True 는 text/secondary, select=False 는 text/subtle — 아이콘 색만 바뀐다.
  const c = active ? "#171717" : "#AFAFAF";
  if (name === "home")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9.97949 2.96472C11.1152 1.86056 12.9139 1.82902 14.0869 2.89343L19.3604 7.67859C20.4046 8.6263 21 9.97151 21 11.3817V16.9999C21 19.7613 18.7614 21.9999 16 21.9999H8C5.23858 21.9999 3 19.7613 3 16.9999V11.8622C3.00007 10.5118 3.54641 9.21857 4.51465 8.27722L9.97949 2.96472ZM11 11.9999C9.89547 11.9999 9.00006 12.8954 9 13.9999V16.9999L9.01074 17.204C9.1062 18.1455 9.85435 18.8937 10.7959 18.9891L11 18.9999H13L13.2041 18.9891C14.2128 18.8869 15 18.0355 15 16.9999V13.9999C14.9999 12.8954 14.1045 11.9999 13 11.9999H11Z" fill={c} />
      </svg>
    );
  if (name === "my-meetups")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15.2967 13.4286C17.5384 13.4286 19.3557 11.5098 19.3557 9.14286C19.3557 6.77592 17.5384 4.85714 15.2967 4.85714C13.0549 4.85714 11.2376 6.77592 11.2376 9.14286C11.2376 11.5098 13.0549 13.4286 15.2967 13.4286Z" fill={c} />
        <path d="M6.50209 9.14286C8.37021 9.14286 9.88462 7.54387 9.88462 5.57143C9.88462 3.59898 8.37021 2 6.50209 2C4.63397 2 3.11956 3.59898 3.11956 5.57143C3.11956 7.54387 4.63397 9.14286 6.50209 9.14286Z" fill={c} />
        <path d="M21.3176 22H9.2487C9.05928 22 8.86986 21.9143 8.74809 21.7571C8.62631 21.6 8.55866 21.4 8.58572 21.2C8.93751 17.5857 11.833 14.8571 15.2831 14.8571C18.7333 14.8571 21.6152 17.5857 21.9941 21.2143C22.0211 21.4143 21.9535 21.6143 21.8317 21.7714C21.7099 21.9286 21.507 22 21.3176 22ZM10.3311 14.8571H2.67306C2.45658 14.8571 2.25363 14.7429 2.11832 14.5571C2.05849 14.4613 2.02009 14.3523 2.00602 14.2384C1.99196 14.1246 2.0026 14.0089 2.03714 13.9C2.36603 12.9272 2.97145 12.0853 3.77064 11.4895C4.56982 10.8938 5.52377 10.5731 6.50209 10.5714C8.50454 10.5714 10.3041 11.9143 10.967 13.9143C11.0347 14.1286 11.0076 14.3714 10.8858 14.5714C10.7641 14.7429 10.5476 14.8571 10.3311 14.8571Z" fill={c} />
      </svg>
    );
  if (name === "my-info")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.489 12.9094C18.6371 12.9095 21.9997 16.1698 22 20.1921C22 21.1903 21.1654 22 20.136 22H3.86401C2.83464 22 2 21.1903 2 20.1921C2.00028 16.1698 5.36294 12.9095 9.51099 12.9094H14.489Z" fill={c} />
        <path d="M12 2C14.7614 2 17 4.17089 17 6.84863C16.9999 9.52631 14.7614 11.6973 12 11.6973L11.7424 11.6912C9.10075 11.5612 7.00008 9.44255 7 6.84863C7 4.17089 9.23858 2 12 2Z" fill={c} />
      </svg>
    );
  // 만들기 — 늘 초록
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7C13 6.44772 12.5523 6 12 6Z" fill="#45B83C" />
    </svg>
  );
}

export default function BottomNavFive({ active }: BottomNavFiveProps) {
  const items = [
    { label: "홈", href: "/home", key: "home" },
    { label: "내 동행", href: "/my-meetups", key: "my-meetups" },
    { label: "내 정보", href: null, key: "my-info" },
    { label: "만들기", href: "/create/activity?new=1", key: "create" },
  ];

  return (
    <nav className="h-[55px] border-t border-[#E5E5E5] bg-white flex items-center justify-around px-1">
      {items.map((item) => {
        const on = active === item.key;
        const body = (
          <>
            <Icon name={item.key} active={on} />
            <span
              className={`text-[12px] font-medium leading-none ${
                item.key === "create" ? "text-[#32952d]" : "text-[#171717]"
              }`}
            >
              {item.label}
            </span>
          </>
        );
        const cls = "flex-1 flex flex-col items-center gap-0.5 pt-1";
        return item.href ? (
          <Link key={item.key} href={item.href} className={cls}>
            {body}
          </Link>
        ) : (
          <span key={item.key} className={`${cls} opacity-60 cursor-not-allowed`}>
            {body}
          </span>
        );
      })}
    </nav>
  );
}
