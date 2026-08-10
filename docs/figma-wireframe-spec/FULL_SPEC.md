# Dorandoran 와이어프레임 전체 스펙 (Figma 원문 그대로, node-id=575:2 하위 페이지 '와이어프레임')

이 문서는 Figma get_metadata로 추출한 실제 텍스트/좌표를 그대로 옮긴 것이다. 화면을 만들 때 이 문서에 없는 문구·기능·아이콘·색을 임의로 추가하지 말 것. 순수 와이어프레임(회색/검정/흰색, 박스+선+텍스트)으로 구현할 것.

## 스크린샷이 있는 화면 (screenshots/ 폴더, 참고용 — 실제 렌더는 여기 이미지를 최대한 따를 것)
내_동행.png
상세_확인.png
스플래시_진입.png
신청_완료.png
위치_권한.png
전달_완료.png
참여_취소.png
참여_후.png
처리_완료.png
카톡_3초_로그인.png
홈_피드_A.png
홈_피드_B.png

---

## 화면: 스플래시_진입
Figma node: 581:3 | name: 스플래시 & 진입 | size: 375x812

- TEXT: "오늘 같이할 사람 찾기"
- TEXT: "장 보러, 산책하러, 커피 한 잔 우리 동네에서 한두 시간"
- GROUP "Frame 48" 327x134
  - GROUP "Frame" 327x60
    - TEXT: "카카오로 시작하기"
  - GROUP "Frame" 327x60
    - TEXT: "그냥 둘러보기"
---

## 화면: 위치_권한
Figma node: 581:19 | name: 위치 권한 | size: 375x812

- TEXT: "가까운 것만 보여드릴게요"
- TEXT: "걸어서 갈 수 있는 곳만 보여드리려고 위치를 확인해요. 위치는 저장하지 않아요."
- GROUP "Frame 48" 327x60
  - GROUP "Frame" 327x60
    - TEXT: "위치 허용하기"
---

## 화면: 홈_피드_A
Figma node: 581:29 | name: 홈 · 피드 | size: 375x812

- TEXT: "지금 신사동에서 세 분이 같이 갈 사람을 찾고 있어요"
- GROUP "Frame 65" 249x31
  - GROUP "Frame 63" 66x29
    - TEXT: "빠른 순"
  - GROUP "Frame 64" 81x31
    - TEXT: "가까운 순"
  - GROUP "Frame 65" 94x31
    - TEXT: "소요시간 순"
- GROUP "Frame" 327x111
  - TEXT: "오늘 3시 · 오일장 구경"
  - TEXT: "걸어서 8분 · 1시간 이내 · 3명 중 2명"
  - TEXT: "봄날의햇살 님"
- GROUP "Frame" 327x111
  - TEXT: "오늘 5시 · 식자재마트"
  - TEXT: "걸어서 12분 · 1시간 이상 · 3명 중 1명"
  - TEXT: "늘푸른소나무 님"
- GROUP "Frame" 327x111
  - TEXT: "내일 10시 · 공원 한 바퀴"
  - TEXT: "걸어서 4분 · 30분 · 3명 모두 모였어요"
  - TEXT: "운영자"
- GROUP "sp" 327x191
- GROUP "Frame" 327x53
  - TEXT: "홈"
  - TEXT: "내 동행"
  - TEXT: "더보기"
---

## 화면: 홈_피드_B
Figma node: 579:358 | name: 홈 · 피드 | size: 375x812

- TEXT: "지금 신사동에서 세 분이 같이 갈 사람을 찾고 있어요"
- GROUP "Frame" 327x116
  - GROUP "Frame 67" 295x26
    - GROUP "Frame 68" 87x26
      - instance "icon / heroicons / Outline / clock"
      - TEXT: "오늘 3시"
    - TEXT: "2 / 3명"
  - GROUP "Frame 68" 295x26
    - GROUP "Frame 68" 109x26
      - instance "icon / heroicons / Outline / chat-alt"
      - TEXT: "오일장 구경"
  - TEXT: "봄날의햇살 님"
- GROUP "Frame" 327x111
  - TEXT: "오늘 5시 · 식자재마트"
  - TEXT: "걸어서 12분 · 1시간 이상 · 3명 중 1명"
  - TEXT: "늘푸른소나무 님"
- GROUP "Frame" 327x111
  - TEXT: "내일 10시 · 공원 한 바퀴"
  - TEXT: "걸어서 4분 · 30분 · 3명 모두 모였어요"
  - TEXT: "운영자"
- GROUP "sp" 327x231
- GROUP "Frame" 327x53
  - TEXT: "홈"
  - TEXT: "내 동행"
  - TEXT: "더보기"
---

## 화면: 카톡_3초_로그인
Figma node: 582:21 | name: 카톡 3초 로그인 | size: 375x812

- TEXT: "이웃과 함께하려면 간단한 본인 확인이 필요해요"
- TEXT: "이름과 연락처만 확인해요. 다른 정보는 받지 않아요."
- GROUP "Frame 48" 327x134
  - GROUP "Frame" 327x60
    - TEXT: "카카오로 3초 만에 시작하기"
  - GROUP "Frame" 327x60
    - TEXT: "뒤로"
---

## 화면: 상세_확인
Figma node: 582:32 | name: 상세 확인 | size: 375x812

- TEXT: "오일장 구경"
- GROUP "Frame 62" 327x549
  - GROUP "Frame" 327x47
    - TEXT: "만드신 분"
    - TEXT: "봄날의햇살 님"
  - GROUP "Frame" 327x47
    - TEXT: "시간"
    - TEXT: "오늘 오후 3시"
  - GROUP "Frame" 327x47
    - TEXT: "걸리는 시간"
    - TEXT: "1시간 이내"
  - GROUP "Frame" 327x47
    - TEXT: "거리"
    - TEXT: "걸어서 8분"
  - GROUP "Frame" 327x47
    - TEXT: "모임인원"
    - TEXT: "2 / 3명"
  - GROUP "Frame" 327x47
    - TEXT: "만나는 곳"
    - TEXT: "신사시장 정문"
  - BOX (Rectangle 17) 327x183
- GROUP "Frame 48" 327x60
  - GROUP "Frame" 327x60
    - TEXT: "참여하기"
---

## 화면: 신청_완료
Figma node: 582:57 | name: 신청 완료 | size: 375x812

- GROUP "sp" 327x221
- TEXT: "신청되었습니다"
- TEXT: "오늘 오후 3시 신사시장 정문에서 만나요 30분 전에 알려드릴게요"
- GROUP "sp" 327x221
- GROUP "Frame 48" 327x60
  - GROUP "Frame" 327x60
    - TEXT: "확인"
---

## 화면: 내_동행
Figma node: 583:3 | name: 내 동행 | size: 375x812

- TEXT: "오늘 나가실 동행"
- GROUP "Frame" 327x177
  - TEXT: "오늘 3시 · 오일장 구경"
  - TEXT: "신사시장 정문 · 걸어서 8분"
  - TEXT: "3명 중 2명 · 한 분 더"
  - GROUP "Frame" 295x60
    - TEXT: "동행 취소하기"
- GROUP "sp" 327x452
- GROUP "Frame" 327x53
  - TEXT: "홈"
  - TEXT: "내 동행"
  - TEXT: "더보기"
---

## 화면: 참여_취소
Figma node: 583:18 | name: 참여 취소 | size: 375x812

- TEXT: "못 가시는군요"
- TEXT: "다른 분들께는 "한 분이 못 오시게 됐어요"만 전해요."
- GROUP "Frame 48" 327x134
  - GROUP "Frame" 327x60
    - TEXT: "못 간다고 알리기"
  - GROUP "Frame" 327x60
    - TEXT: "취소"
---

## 화면: 처리_완료
Figma node: 583:29 | name: 처리 완료 | size: 375x812

- TEXT: "전해드렸어요"
- TEXT: "신뢰 온도는 그대로예요. 다음에 또 나오시면 됩니다."
- GROUP "Frame" 327x60
  - TEXT: "확인"
---

## 화면: 참여_후
Figma node: 583:66 | name: 참여 후 | size: 375x812

- TEXT: "오늘 어떠셨어요?"
- TEXT: "고마웠던 분께 인사를 전해보세요. 한 분께만 전할 수 있어요."
- GROUP "Frame 59" 327x185
  - GROUP "Frame 57" 327x85
    - GROUP "Frame" 156x85
      - TEXT: "A 님"
      - TEXT: "오늘 함께하신 분"
    - GROUP "Frame" 156x85
      - TEXT: "B 님"
      - TEXT: "오늘 함께하신 분"
  - GROUP "Frame 58" 327x85
    - GROUP "Frame" 156x85
      - TEXT: "C 님"
      - TEXT: "오늘 함께하신 분"
    - GROUP "Frame" 156x85
      - TEXT: "D 님"
      - TEXT: "오늘 함께하신 분"
- GROUP "Frame 48" 327x134
  - GROUP "Frame" 327x60
    - TEXT: "고마웠어요 전하기"
  - GROUP "Frame" 327x60
    - TEXT: "건너뛰기"
---

## 화면: 전달_완료
Figma node: 583:79 | name: 전달 완료 | size: 375x812

- TEXT: "전해드렸어요"
- TEXT: "고양고양 님도 오늘 인사를 받으셨어요."
- GROUP "Frame" 327x60
  - TEXT: "확인"
---

## 화면: 로그인
Figma node: 575:58 | name: 로그인 | size: 375x812

- GROUP "Frame 25" 285x57
  - TEXT: "그냥 둘러보기"
- GROUP "Frame 26" 285x57
  - TEXT: "카톡 로그인"
- GROUP "Frame 27" 285x57
  - TEXT: "휴대폰 번호로 시작하기"
---

## 화면: 위치정보
Figma node: 578:141 | name: 위치정보 | size: 375x812

- BOX (Rectangle 5) 375x404
- GROUP "Frame 25" 285x57
  - TEXT: "허용"
- GROUP "Frame 26" 285x57
  - TEXT: "허용안함"
- TEXT: "서비스를 이용하려면 위치 정보 권한이 필요해요"
---

## 화면: 위치정보_허용안함
Figma node: 578:1162 | name: 위치정보_허용안함 | size: 375x812

- BOX (Rectangle 14) 333x508
- GROUP "Frame 32" 375x68
  - regular-polygon "Polygon 1"
- TEXT: "내가 위치한 곳을 선택해주세요"
- GROUP "Frame 52" 296x62
  - TEXT: "선택"
- GROUP "Group 3" 42.11775207519531x42.11775207519531
- ellipse "Ellipse 3"
- TEXT: "직접 입력"
---

## 화면: 홈_만들기
Figma node: 578:618 | name: 홈_만들기 | size: 375x812

- GROUP "Frame 26" 285x57
  - TEXT: "카톡 로그인"
- GROUP "Frame 27" 285x57
  - TEXT: "휴대폰 번호로 시작하기"
- TEXT: "이웃을 만나려면 로그인이 필요해요"
---

## 화면: 홈_만들기_로그인_웰컴
Figma node: 575:61 | name: 홈_만들기_로그인_웰컴 | size: 375x812

- TEXT: "다람쥐님 환영합니다"
- BOX (Rectangle 1) 166x166
- GROUP "Frame 26" 334x57
  - TEXT: "확인"
---

## 화면: 홈_A
Figma node: 575:76 | name: 홈 | size: 375x812

- GROUP "Frame 32" 375x67
  - GROUP "Frame 26" 91x57
    - TEXT: "로고"
  - GROUP "Frame 29" 67x57
    - TEXT: "내 정보"
- GROUP "Frame 39" 341x466
  - GROUP "Frame 41" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "귀여운양양 / 송정동"
    - GROUP "Frame 35" 307x30
      - TEXT: "뜨개질 같이 해요"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 13시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 1 / 5"
      - TEXT: "모임 장소: 동사무소 시민회의실"
  - GROUP "Frame 37" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "노스탤지어 / 화봉동"
    - GROUP "Frame 35" 307x30
      - TEXT: "오후에 강아지 산책 합니다"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 10시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 2 / 3"
      - TEXT: "모임 장소: 도토리마을 공원"
  - GROUP "Frame 38" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 156x24
        - ellipse "Ellipse 2"
        - TEXT: "낮잠자고싶다 / 연암동"
    - GROUP "Frame 35" 307x30
      - TEXT: "반찬 나눔"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "시간: 16시"
        - TEXT: "예상 소요: 5분"
        - TEXT: "참여자: 3 / 6"
      - TEXT: "모임 장소: 보문 아파트 정문 앞"
- GROUP "Frame 31" 375x67
  - GROUP "Frame 26" 68.19999694824219x57
    - TEXT: "홈"
  - GROUP "Frame 30" 68.19999694824219x57
    - TEXT: "내 동행"
  - GROUP "Frame 29" 68.20000457763672x57
    - TEXT: "알림"
  - GROUP "Frame 27" 68.20000457763672x57
    - TEXT: "채팅"
  - GROUP "Frame 28" 68.19999694824219x57
    - TEXT: "만들기"
- GROUP "Frame 43" 697x159
  - TEXT: "곧 시작하는 모임"
  - GROUP "Frame 42" 697x121
    - GROUP "Frame 36" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 118x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼 / 화봉동"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "시작 시간: 13시"
          - GROUP "Frame 47" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
    - GROUP "Frame 37" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 67x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼"
        - TEXT: "5분 전"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
          - GROUP "Frame 46" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "동네: 은평동"
---

## 화면: 홈_B
Figma node: 578:700 | name: 홈 | size: 375x812

- GROUP "Frame 32" 375x67
  - GROUP "Frame 26" 91x57
    - TEXT: "로고"
  - GROUP "Frame 29" 67x57
    - TEXT: "내 정보"
- GROUP "Frame 39" 341x625
  - GROUP "Frame 41" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "귀여운양양 / 연암동"
    - GROUP "Frame 35" 307x30
      - TEXT: "수영 교실 등록 함께할 분"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 채팅 협의"
        - TEXT: "예상 소요: 10분"
        - TEXT: "참여자: 1 / 3"
      - TEXT: "모임 장소: 시민체육센터"
  - GROUP "Frame 42" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "귀여운양양 / 송정동"
    - GROUP "Frame 35" 307x30
      - TEXT: "뜨개질 같이 해요"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 13시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 1 / 3"
      - TEXT: "모임 장소: 동사무소 시민회의실"
  - GROUP "Frame 43" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "노스탤지어 / 화봉동"
    - GROUP "Frame 35" 307x30
      - TEXT: "오후에 강아지 산책 합니다"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 10시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 2 / 6"
      - TEXT: "모임 장소: 도토리마을 공원"
  - GROUP "Frame 44" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 106x24
        - ellipse "Ellipse 2"
        - TEXT: "낮잠자고싶다"
      - TEXT: "25분 전"
    - GROUP "Frame 35" 307x30
      - TEXT: "반찬 나눔"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "시간: 16시"
        - TEXT: "예상 소요: 5분"
        - TEXT: "참여자: 3명"
      - TEXT: "모임 장소: 보문 아파트 정문 앞"
- GROUP "Frame 31" 375x67
  - GROUP "Frame 26" 68.19999694824219x57
    - TEXT: "홈"
  - GROUP "Frame 30" 68.19999694824219x57
    - TEXT: "내 동행"
  - GROUP "Frame 29" 68.20000457763672x57
    - TEXT: "알림"
  - GROUP "Frame 27" 68.20000457763672x57
    - TEXT: "채팅"
  - GROUP "Frame 28" 68.19999694824219x57
    - TEXT: "만들기"
- GROUP "Frame 43" 697x159
  - TEXT: "곧 시작하는 모임"
  - GROUP "Frame 42" 697x121
    - GROUP "Frame 36" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 118x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼 / 화봉동"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "시작 시간: 13시"
          - GROUP "Frame 47" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
    - GROUP "Frame 37" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 67x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼"
        - TEXT: "5분 전"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
          - GROUP "Frame 46" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "동네: 은평동"
---

## 화면: 홈_알림
Figma node: 578:1232 | name: 홈_알림 | size: 375x812

- GROUP "Frame 32" 375x67
  - GROUP "Frame 26" 91x57
    - TEXT: "로고"
  - GROUP "Frame 29" 67x57
    - TEXT: "내 정보"
- GROUP "Frame 39" 341x625
  - GROUP "Frame 41" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "귀여운양양 / 연암동"
    - GROUP "Frame 35" 307x30
      - TEXT: "수영 교실 등록 함께할 분"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 채팅 협의"
        - TEXT: "예상 소요: 10분"
        - TEXT: "참여자: 1명"
      - TEXT: "모임 장소: 시민체육센터"
  - GROUP "Frame 42" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "귀여운양양 / 송정동"
    - GROUP "Frame 35" 307x30
      - TEXT: "뜨개질 같이 해요"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 13시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 1명"
      - TEXT: "모임 장소: 동사무소 시민회의실"
  - GROUP "Frame 43" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 143x24
        - ellipse "Ellipse 2"
        - TEXT: "노스탤지어 / 화봉동"
    - GROUP "Frame 35" 307x30
      - TEXT: "오후에 강아지 산책 합니다"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "모임시간: 10시"
        - TEXT: "예상 소요: 1시간"
        - TEXT: "참여자: 2명"
      - TEXT: "모임 장소: 도토리마을 공원"
  - GROUP "Frame 44" 341x148
    - GROUP "Frame 38" 307x24
      - GROUP "Frame 33" 106x24
        - ellipse "Ellipse 2"
        - TEXT: "낮잠자고싶다"
      - TEXT: "25분 전"
    - GROUP "Frame 35" 307x30
      - TEXT: "반찬 나눔"
    - GROUP "Frame 34" 307x48
      - GROUP "Frame 37" 307x21
        - TEXT: "시간: 16시"
        - TEXT: "예상 소요: 5분"
        - TEXT: "참여자: 3명"
      - TEXT: "모임 장소: 보문 아파트 정문 앞"
- GROUP "Frame 31" 375x67
  - GROUP "Frame 26" 68.19999694824219x57
    - TEXT: "홈"
  - GROUP "Frame 30" 68.19999694824219x57
    - TEXT: "내 동행"
  - GROUP "Frame 29" 68.20000457763672x57
    - TEXT: "알림"
  - GROUP "Frame 27" 68.20000457763672x57
    - TEXT: "채팅"
  - GROUP "Frame 28" 68.19999694824219x57
    - TEXT: "만들기"
- GROUP "Frame 61" 367x76
  - GROUP "Frame 60" 337x44
    - TEXT: "내 모임에 동행이 1명 추가되었어요"
    - TEXT: "동행 예정: 동그랑땡 / 호계동 (이전에 만난 적이 없는 참여자예요)"
- GROUP "Frame 43" 697x159
  - TEXT: "곧 시작하는 모임"
  - GROUP "Frame 42" 697x121
    - GROUP "Frame 36" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 118x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼 / 화봉동"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "시작 시간: 13시"
          - GROUP "Frame 47" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
    - GROUP "Frame 37" 341x121
      - GROUP "Frame 38" 307x24
        - GROUP "Frame 33" 67x24
          - ellipse "Ellipse 2"
          - TEXT: "달토끼"
        - TEXT: "5분 전"
      - GROUP "Frame 35" 307x30
        - TEXT: "모여서 대보름 부럼 까기"
      - GROUP "Frame 34" 307x21
        - GROUP "Frame 47" 307x21
          - GROUP "Frame 45" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "보고 있는 사람: 42명"
          - GROUP "Frame 46" 153.5x21
            - ellipse "Ellipse 3"
            - TEXT: "동네: 은평동"
---

## 화면: 만들기_1
Figma node: 578:353 | name: 만들기_1 | size: 375x812

- GROUP "Frame 32" 375x68
  - regular-polygon "Polygon 1"
- GROUP "Frame 51" 339x62
  - TEXT: "다음"
- GROUP "Frame 52" 99x31
  - TEXT: "장보러가요"
- GROUP "Frame 53" 86x31
  - TEXT: "김장해요"
- GROUP "Frame 54" 115x31
  - TEXT: "반찬 나눌게요"
- GROUP "Frame 55" 115x31
  - TEXT: "같이 등록해요"
- TEXT: "모임명을 입력해주세요"
- LINE/ICON (Vector 25) 339x0
- TEXT: "어떤 동행을 구하시나요?"
- TEXT: "1/2"
- TEXT: "아니면 아래에서 선택해보세요"
---

## 화면: 만들기_2
Figma node: 578:506 | name: 만들기_2 | size: 375x1040

- BOX (Rectangle 6) 341x197
- GROUP "Frame 32" 375x65
  - regular-polygon "Polygon 1"
- TEXT: "하고 싶은 활동에 대해 소개 해주세요"
- GROUP "Frame 52" 339x62
  - TEXT: "등록"
- TEXT: "음성으로 입력하기"
- TEXT: "1/2"
- BOX (Rectangle 13) 340x112
- BOX (Rectangle 14) 341x42
- BOX (Rectangle 8) 86x42
- BOX (Rectangle 9) 339x42
- TEXT: "예상 소요 시간"
- TEXT: "시작 시간"
- TEXT: "00:00"
- TEXT: "3"
- TEXT: "최대 인원"
- TEXT: "모임 장소"
- TEXT: "최소 인원은 3명이어야 합니다 안전한 장소에서 만나요"
- TEXT: "안내"
- TEXT: "도토리마을 공원"
- TEXT: "위치 찾기"
- GROUP "Frame 53" 63x31
  - TEXT: "10분"
- GROUP "Frame 54" 63x31
  - TEXT: "30분"
- GROUP "Frame 55" 97x31
  - TEXT: "1시간 이내"
- GROUP "Frame 56" 97x31
  - TEXT: "1시간 이상"
- BOX (Rectangle 18) 24x6
- boolean-operation "Union"
---

## 화면: 만들기_3
Figma node: 578:1538 | name: 만들기_3 | size: 375x1040

- GROUP "Frame 32" 375x65
  - regular-polygon "Polygon 1"
- GROUP "Group 4" 342x930
  - BOX (Rectangle 6) 341x197
  - TEXT: "하고 싶은 활동에 대해 소개 해주세요"
  - GROUP "Frame 52" 339x62
    - TEXT: "등록"
  - TEXT: "음성으로 입력하기"
  - TEXT: "1/2"
  - BOX (Rectangle 13) 340x112
  - BOX (Rectangle 14) 341x42
  - BOX (Rectangle 8) 86x42
  - BOX (Rectangle 9) 339x42
  - TEXT: "예상 소요 시간"
  - TEXT: "시작 시간"
  - TEXT: "00:00"
  - TEXT: "3"
  - TEXT: "최대 인원"
  - TEXT: "모임 장소"
  - TEXT: "최소 인원은 3명이어야 합니다 안전한 장소에서 만나요"
  - TEXT: "안내"
  - TEXT: "도토리마을 공원"
  - TEXT: "위치 찾기"
  - GROUP "Frame 53" 63x31
    - TEXT: "10분"
  - GROUP "Frame 54" 63x31
    - TEXT: "30분"
  - GROUP "Frame 55" 97x31
    - TEXT: "1시간 이내"
  - GROUP "Frame 56" 97x31
    - TEXT: "1시간 이상"
  - BOX (Rectangle 18) 24x6
  - boolean-operation "Union"
---

## 화면: 만들기_4
Figma node: 578:655 | name: 만들기_4 | size: 375x812

- BOX (Rectangle 14) 333x562
- GROUP "Frame 32" 375x68
  - regular-polygon "Polygon 1"
- GROUP "Frame 50" 154x28
  - ellipse "Ellipse 3"
  - GROUP "Frame 49" 133x28
    - TEXT: "현재 내 위치: 은평동"
- TEXT: "만나고 싶은 장소를 선택해주세요"
- GROUP "Frame 52" 296x62
  - TEXT: "선택"
- GROUP "Group 3" 42.11775207519531x42.11775207519531
- ellipse "Ellipse 3"
- BOX (Rectangle 9) 317x42
- ellipse "Ellipse 4"
- TEXT: "검색할 위치를 입력하세요"
---

