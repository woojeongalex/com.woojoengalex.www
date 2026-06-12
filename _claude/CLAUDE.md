# CLAUDE.md — 프론트엔드 (alexview) 인수인계

> 모노레포 루트 → [[CLAUDE|CLAUDE.md (woojeongalex.cloud 루트)]]  
> 전역 원칙·행동 하네스 → [[woojeongai/_claude/CLAUDE|`woojeongai/_claude/CLAUDE.md`]]  
> 백엔드 API → [[woojeongai/CLAUDE|`woojeongai/CLAUDE.md`]]

---

## 0. 문서 읽는 순서 (프론트엔드)

| 순서 | 문서 | 역할 |
|------|------|------|
| 1 | `../CLAUDE.md` | 전역 원칙·행동 하네스 |
| 2 | **본 파일** `alexview/CLAUDE.md` | 프론트엔드 인수인계 정본 |

**우선순위 (충돌 시):** 사용자 지시 > 본 파일 > `../CLAUDE.md`

---

## 1. 기술 스택

- **프레임워크:** Next.js (App Router)
- **언어:** TypeScript
- **스타일:** Tailwind CSS
- **패키지 매니저:** pnpm

---

## 2. 저장소 레이아웃

```
alexview/
  app/                  # Next.js App Router 페이지
  components/           # 재사용 UI 컴포넌트
  lib/                  # API 클라이언트·유틸
  public/               # 정적 파일
```

---

## 3. API 연동 규칙

- 백엔드 호출은 `lib/` 아래 API 클라이언트 함수로 추상화한다.
- 컴포넌트에서 `fetch`/`axios` 직접 호출 금지 — `lib/api/` 경유.
- 환경 변수: `NEXT_PUBLIC_API_URL` (`.env.local` — 커밋 금지).

---

## 4. 컴포넌트 규칙

- Server Component 기본, 클라이언트 상태가 필요할 때만 `"use client"`.
- 페이지 컴포넌트는 데이터 패칭만, UI 렌더링은 하위 컴포넌트에 위임.
- Props 타입은 `interface`로 명시, `any` 금지.

---

## 5. 코딩 규칙

- **코드 출력 규칙: 설명 없이 코드만 출력**
- **수정 범위: 지시한 파일·부분만 수정, 임의 파일 변경 금지**
- 타입 오류 없이 `tsc --noEmit` 통과.
- 로컬 실행: `pnpm dev` (포트 3000)

---

*세부 규칙 추가 시 본 파일을 업데이트한다.*
