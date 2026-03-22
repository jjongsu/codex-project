# Supabase 사용 가이드

이 문서는 현재 프로젝트 코드 기준으로 `Supabase`를 어떻게 사용하고 있는지, 그리고 새 기능을 붙일 때 어떤 경로를 선택해야 하는지 정리한 문서다.

## 1. 현재 프로젝트에서 Supabase가 맡는 역할

현재 Supabase는 크게 두 가지 방식으로 연결되어 있다.

1. 게임 점수 저장과 랭킹 조회를 위한 서버 전용 접근
2. 향후 인증/세션 기반 기능을 대비한 SSR 클라이언트 접근

핵심은 아래처럼 나뉜다.

- 점수 저장과 랭킹 조회는 브라우저가 직접 DB에 쓰지 않고 `Next.js Route Handler`를 경유한다.
- 세션이 필요한 화면 데이터 조회는 `@supabase/ssr` 기반 헬퍼를 통해 `Server Component` 또는 브라우저에서 접근할 수 있게 준비되어 있다.

## 2. 전체 구조 한눈에 보기

### A. 점수 저장/조회용 서버 전용 레이어

이 경로는 현재 실제 게임 점수 API에서 사용 중이다.

```text
Browser
  -> /api/scores
  -> src/server/scores/repository.ts
  -> src/server/supabase/client.ts
  -> Supabase high_scores
```

관련 파일:

- `src/app/api/scores/route.ts`
- `src/server/scores/repository.ts`
- `src/server/supabase/client.ts`
- `src/server/supabase/env.ts`
- `supabase/migrations/20260322234500_create_high_scores.sql`

이 구조를 쓰는 이유:

- 입력 검증을 서버에서 한 번 더 할 수 있다.
- 브라우저에 서버 전용 키를 노출하지 않는다.
- 이후 rate limit, 안티치트, 캐싱, 로깅을 한 곳에서 붙이기 쉽다.

### B. 세션/SSR용 Supabase 헬퍼 레이어

이 경로는 `@supabase/ssr` 기반으로 추가한 구조다.

```text
Server Component / Client Component
  -> src/utils/supabase/server.ts or client.ts
  -> src/utils/supabase/proxy.ts
  -> src/proxy.ts
  -> Supabase
```

관련 파일:

- `src/utils/supabase/env.ts`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/client.ts`
- `src/utils/supabase/proxy.ts`
- `src/proxy.ts`
- `src/app/page.tsx`

현재 홈 페이지의 Supabase 섹션은 이 SSR 헬퍼를 사용해 `todos` 테이블을 읽어오도록 연결되어 있다.

## 3. 환경 변수 정리

현재 구조상 최소로 필요한 환경 변수는 아래 3개다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-server-secret-key
```

각 변수의 역할:

- `NEXT_PUBLIC_SUPABASE_URL`
  - Supabase 프로젝트 URL
  - 브라우저와 서버 모두에서 사용 가능
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - 공개용 publishable key
  - `@supabase/ssr` 브라우저/SSR 헬퍼에서 사용
- `SUPABASE_SECRET_KEY`
  - 서버 전용 비밀 키
  - `src/server/supabase/*`에서만 사용
  - 절대 클라이언트 번들에서 사용하면 안 된다

주의:

- 현재 홈 페이지의 SSR 예시는 공개 키만 있어도 동작 가능하다.
- 반면 `/api/scores`는 `SUPABASE_SECRET_KEY`가 없으면 `503`을 반환한다.
- `.env.local`은 루트에 두어야 하며, `src` 안에 두면 Next.js가 읽지 않는다.

## 4. 설치 패키지

현재 프로젝트에서 사용하는 패키지는 아래 두 개다.

```bash
npm install @supabase/supabase-js @supabase/ssr
```

역할은 아래처럼 나뉜다.

- `@supabase/supabase-js`
  - 서버 전용 점수 저장/조회 클라이언트
- `@supabase/ssr`
  - 브라우저/SSR/세션 갱신 헬퍼

## 5. 데이터베이스 구조

현재 마이그레이션 파일은 아래다.

- `supabase/migrations/20260322234500_create_high_scores.sql`

현재 `high_scores` 테이블은 다음 기준으로 만들어져 있다.

- `id`: UUID 기본키
- `game_slug`: 허용 게임만 저장되도록 체크 제약조건 적용
- `player_name`: `A-Z` 1~3글자만 허용
- `score`: 0 이상 정수
- `created_at`: 생성 시각

추가로 아래 인덱스가 들어가 있다.

- `(game_slug, score desc, created_at asc)`

이 인덱스는 게임별 랭킹 조회를 빠르게 하기 위한 것이다.

RLS도 켜져 있다.

```sql
alter table public.high_scores enable row level security;
```

다만 현재 점수 API는 서버 전용 키를 사용하는 구조이므로, 브라우저가 직접 `high_scores`에 접근하는 방식은 전제로 두지 않는다.

## 6. 현재 점수 API 사용 방식

### 랭킹 조회

```http
GET /api/scores?game=block-jam-blitz&limit=10
```

동작 순서:

1. `game`과 `limit`를 검증한다.
2. Supabase 서버 설정 존재 여부를 확인한다.
3. `high_scores`에서 점수순, 동점 시 오래된 기록 우선으로 조회한다.

실제 코드는 `src/app/api/scores/route.ts`와 `src/server/scores/repository.ts`에 있다.

### 점수 저장

```http
POST /api/scores
Content-Type: application/json

{
  "gameSlug": "block-jam-blitz",
  "playerName": "KIM",
  "score": 12345
}
```

동작 순서:

1. 요청 본문을 스키마로 검증한다.
2. 게임별 점수 규칙을 다시 검증한다.
3. 통과하면 Supabase에 insert 한다.

즉, 현재 프로젝트에서 점수 저장은 "클라이언트에서 Supabase 직접 쓰기"가 아니라 "Route Handler를 통해 서버에서 쓰기"가 기준이다.

## 7. SSR 헬퍼 사용 방식

`src/utils/supabase/*`는 세션 기반 SSR 패턴을 위한 레이어다.

### 서버 컴포넌트에서 읽기

```ts
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('todos').select('id, name')

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

이 헬퍼는 내부에서 `await cookies()`를 사용하므로, Next.js 15+ / 16의 비동기 쿠키 API와 맞는다.

### 브라우저에서 읽기/쓰기

```ts
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
```

이 경로는 인증 세션을 쓰는 화면, 로그인 이후 사용자별 데이터 화면에서 활용하기 좋다.

### 세션 갱신

Next.js 16에서는 `middleware.ts` 대신 `proxy.ts`를 사용한다.

현재 프로젝트는 아래 구조로 세션 갱신을 연결했다.

- `src/proxy.ts`
- `src/utils/supabase/proxy.ts`

즉, 세션 기반 기능을 확장할 때는 기존 `proxy.ts`를 기준으로 이어가면 된다.

## 8. 어떤 상황에 어떤 Supabase 레이어를 써야 하나

### `src/server/supabase/*`를 써야 하는 경우

- 서버 전용 키가 필요한 작업
- 점수 저장처럼 브라우저에서 직접 쓰면 안 되는 작업
- 검증, 필터링, rate limit, 안티치트 로직이 함께 필요한 작업
- Route Handler 내부에서만 수행해야 하는 작업

예:

- `/api/scores` 저장
- `/api/scores` 랭킹 조회
- 관리자용 집계 작업

### `src/utils/supabase/*`를 써야 하는 경우

- 인증 세션 기반 화면이 필요한 경우
- `Server Component`에서 사용자 세션을 바탕으로 데이터를 읽는 경우
- 브라우저와 서버에서 같은 공개 키 기반 클라이언트 패턴을 공유하고 싶은 경우

예:

- 로그인 후 마이페이지
- 사용자별 todo 목록
- 세션을 유지한 상태의 읽기/쓰기

## 9. 현재 코드 기준 주의사항

### 1. 1차 버전의 핵심 기능은 아직 Auth가 아니다

기획서 기준 현재 1차 버전의 핵심은 로그인 없는 랭킹 저장이다.

즉:

- 점수 저장은 여전히 `Route Handler + 서버 전용 키` 구조가 중심이다.
- `@supabase/ssr` 헬퍼는 앞으로 인증 기능을 붙일 수 있게 미리 준비한 기반에 가깝다.

### 2. 홈 페이지의 `todos` 조회는 예시 성격이 강하다

현재 `src/app/page.tsx`는 연결 확인용으로 `todos` 테이블을 읽는다.

따라서:

- `todos` 테이블이 없으면 홈 페이지 Supabase 섹션에 쿼리 에러 메시지가 나온다.
- 실제 운영에서는 이 부분을 사용자 데이터나 프로젝트 도메인 데이터에 맞게 바꾸는 것이 좋다.

### 3. `SUPABASE_SECRET_KEY`는 절대 브라우저에서 쓰면 안 된다

이 키는 아래 경로에서만 써야 한다.

- `src/server/supabase/client.ts`
- `src/server/supabase/env.ts`
- 서버 전용 Route Handler 또는 서버 유틸

### 4. 공개 키 기반으로 테이블에 직접 접근하려면 정책이 먼저 필요하다

향후 브라우저 또는 SSR 공개 키 클라이언트로 특정 테이블에 직접 접근할 계획이라면 아래를 먼저 검토해야 한다.

- RLS 정책 설계
- 읽기/쓰기 범위 제한
- 사용자 세션 전제 여부

## 10. 새 기능을 붙일 때 추천 순서

### 랭킹/점수/운영 데이터 기능을 추가할 때

1. Supabase 마이그레이션 추가
2. 서버 전용 repository 함수 추가
3. Route Handler에서 검증 후 repository 호출
4. 클라이언트는 Route Handler만 호출

### 로그인/사용자 세션 기능을 추가할 때

1. `src/utils/supabase/env.ts` 기준으로 공개 변수 설정
2. `src/utils/supabase/server.ts`와 `client.ts` 사용
3. `src/proxy.ts`를 유지하며 세션 갱신 연결
4. 필요한 테이블에 RLS 정책 추가

## 11. 빠른 체크리스트

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`이 있는가
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`가 있는가
- `/api/scores`를 쓸 예정이면 `SUPABASE_SECRET_KEY`도 있는가
- 새 테이블을 만들었으면 Supabase migration 파일이 있는가
- 브라우저 직접 접근을 허용할 계획이면 RLS 정책을 설계했는가
- 인증 세션이 필요하면 `src/proxy.ts` 흐름을 유지하고 있는가

## 12. 관련 파일 모음

- `src/app/api/scores/route.ts`
- `src/server/scores/repository.ts`
- `src/server/supabase/client.ts`
- `src/server/supabase/env.ts`
- `src/utils/supabase/client.ts`
- `src/utils/supabase/server.ts`
- `src/utils/supabase/proxy.ts`
- `src/proxy.ts`
- `src/app/page.tsx`
- `supabase/migrations/20260322234500_create_high_scores.sql`
