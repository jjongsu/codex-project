Original prompt: 그래 그러면 첫번째 게임을 먼저 개발할 수 있도록 스킬들을 사용해서 TODO 형태로 작성해줘 [$develop-web-game](/Users/hwangjongsu/.codex/skills/develop-web-game/SKILL.md) [$update-docs](/Users/hwangjongsu/.agents/skills/update-docs/SKILL.md)

## 2026-03-27

- 현재 판단: `Snake Survivor`에 바로 들어가기보다 `Block Jam Blitz`를 첫 번째 완성 템플릿으로 마감하는 것이 우선이다.
- 문서 반영: `docs/project-plan.md`에 `Block Jam Blitz` 실행 TODO 섹션을 추가했다.
- 작업 기준: `작게 구현 -> Playwright로 짧게 재현 -> 스크린샷/텍스트 상태 확인 -> 콘솔 에러 수정 -> 다음 작업` 순서를 유지한다.

### Next TODO

- `Block Jam Blitz`의 모바일 드래그 UX와 게임 오버 후 제출 흐름을 먼저 다듬는다.
- 현재 게임 전용 UI를 공통 `HUD`, `ScoreSubmitForm`, `LeaderboardPanel`로 분리한다.
- `/ranking`과 홈 화면을 실데이터 기준으로 마감한다.
- 구현 중 규칙이나 UX가 바뀌면 `docs/project-plan.md`, `docs/supabase-usage-guide.md`, `src/features/games/block-jam-blitz/README.md`를 같이 갱신한다.

## 2026-03-27 A-phase update

- 구현: `Block Jam Blitz`에 `window.render_game_to_text()`와 `window.advanceTime(ms)` 훅을 연결했다.
- 구현: 자동화용 `start`, `midgame`, `game-over` 시나리오와 고정 액션 파일을 추가했다.
- 구현: 테스트 래퍼 `scripts/run-block-jam-dev-loop.mjs`와 `npm run test:block-jam:loop` 스크립트를 추가했다.
- 구현: 키보드 자동화 입력을 지원한다. `Arrow` 이동, `A/B` 큐 전환, `Enter/Space` 배치.
- 검증: `npm run typecheck`, `npm run lint` 통과.
- 검증: Playwright 루프로 `start`, `midgame`, `game-over` 시나리오를 각각 실행했고 `state-0.json`과 `shot-0.png`를 확인했다.
- 참고: 이 환경에서는 Playwright 브라우저가 `localhost:3001`에는 접속되지만 `127.0.0.1`에는 연결되지 않았다.
- 참고: 자동화 클라이언트의 클릭 포커스가 불안정해서 현재는 `BLOCK_JAM_CLICK_SELECTOR=none`으로 실행하는 것이 안정적이다.

### Next TODO after A

- `Block Jam Blitz` 모바일 드래그 UX를 자동화 루프와 함께 보정한다.
- 현재 `shot-0.png`는 페이지 상단 위주로 저장되므로, 캔버스 중심 캡처 품질을 한 번 더 개선한다.
- `GameShell`과 `Block Jam Blitz` 전용 패널을 공통 컴포넌트로 쪼개기 시작한다.

## 2026-03-27 B-phase update

- 구현: 자동화 모드에서 사이트 헤더, 푸터, 게임 상세 히어로를 숨겨 캔버스 중심 스크린샷 레이아웃을 고정했다.
- 구현: `Block Jam Blitz` 상단 HUD에 선택 상태와 자동화용 큐 요약을 노출해서 보드 상태를 스크린샷만 봐도 읽기 쉽게 만들었다.
- 구현: Phaser 캔버스에서 보드가 배경 레이어 뒤에 가려지던 문제를 고쳤다. 보드, 고스트, 큐 슬롯의 depth를 명시하고 보드 위치를 조금 아래로 내려 자동화 캡처 구성을 정리했다.
- 구현: Playwright 래퍼가 `develop-web-game` 공용 클라이언트를 계속 사용하면서도 로컬 viewport와 대기 타이밍을 보정하도록 유지했다.
- 검증: `start`, `midgame`, `game-over` 자동화 루프를 다시 실행했고 `output/web-game/block-jam-blitz/*/shot-0.png`에서 보드, 고스트, 큐가 선명하게 보이는 것을 확인했다.
- 검증: `npm run typecheck`, `npm run lint` 통과.

### Next TODO after B

- 모바일 터치 드래그에서 손가락 아래 가려지는 느낌을 더 줄이도록 프리뷰 오프셋과 드롭 피드백을 추가 보정한다.
- 게임 오버 시 점수 제출 성공, 실패, 재시작 흐름을 자동화 시나리오로 더 촘촘하게 검증한다.
- 현재 `Block Jam Blitz` 전용 HUD와 패널을 공통 `shared/components`로 분리할 준비를 시작한다.

## 2026-03-29 B-phase touch follow-up

- 구현: 터치 드래그 시작 시 블록 프리뷰가 손가락 위로 들려 보이도록 오프셋을 조정했고, 보드 근처에서는 후보 위치를 더 부드럽게 스냅하도록 보정했다.
- 구현: 드롭 성공/실패 위치에 짧게 남는 `placement feedback` 오버레이를 추가해 모바일에서도 놓인 자리와 실패한 자리를 더 바로 이해할 수 있게 했다.
- 구현: 선택 상태와 자동화 상태에 `pointerKind`를 넣어 터치/마우스 구분이 가능하도록 정리했다.
- 구현: 모바일 계열 포인터에서는 `Control Hint`가 키보드 안내 대신 터치 안내를 보여주도록 바꿨다.
- 구현: 실제 플레이 화면에서는 게임 오버 직후 점수 제출 카드가 모바일 본문 흐름 안에 바로 보이도록 옮겼고, 입력 필드에 `id`와 `name`을 추가했다.
- 검증: `npm run typecheck`, `npm run lint` 통과.
- 검증: Chrome DevTools 모바일 에뮬레이션으로 `midgame`, `game-over` 화면을 다시 확인했고, 터치 안내 문구와 보드/큐 레이아웃이 의도대로 보이는 것을 확인했다.
- 참고: 이번 세션에서는 CLI에서 돌리는 Playwright 루프가 로컬 dev 서버에 접속하지 못했다. 브라우저 MCP는 `localhost:3000`에 접속되지만, CLI Playwright는 `127.0.0.1`과 `localhost` 모두 `ERR_CONNECTION_REFUSED`가 발생했다.
- 참고: 콘솔에는 새 런타임 에러는 없었고, 현재 남아 있는 것은 favicon 계열로 보이는 `404` 하나뿐이다.

### Next TODO after 2026-03-29

- 실제 드래그를 CLI 루프에서도 재현할 수 있도록 로컬 dev server 접속 경계 또는 터치 드래그 전용 디버그 훅을 정리한다.
- 비자동화 게임 화면에서 `게임 오버 -> 이름 입력 -> 저장 -> 랭킹 반영` 흐름을 실제로 끝까지 검증한다.
- `Block Jam Blitz` 전용 HUD, 점수 제출 카드, 랭킹 패널을 공통 컴포넌트로 쪼개는 작업으로 넘어간다.

## 2026-03-29 final revalidation

- 검증: `npm run typecheck`, `npm run lint` 재통과.
- 검증: Next.js MCP `get_errors` 결과 `configErrors`, `sessionErrors` 모두 비어 있었다.
- 검증: Chrome DevTools 모바일 에뮬레이션으로 `start`, `midgame`, `game-over` 자동화 시나리오를 다시 확인했다.
- 검증: `start`에서는 빈 8x8 보드, 초기 큐 3개, 터치 안내 문구가 정상적으로 보였고 `render_game_to_text()` 결과도 같은 상태였다.
- 검증: `midgame`에서는 보드 선택 상태와 터치 안내가 보였고, `Enter` 입력 후 점수 `510`, 콤보 `2`, 줄 제거 상태가 화면과 `render_game_to_text()` 모두에서 일치했다.
- 검증: `game-over`에서는 점수 `612`, `Run Locked`, 게임 오버 상태가 화면과 `render_game_to_text()` 모두에서 일치했다.
- 검증: 브라우저 콘솔을 다시 확인했을 때 폼 접근성 경고는 사라졌고, 현재 페이지 기준 새 콘솔 에러는 없었다.
- 참고: 이번 최종 재검증도 CLI Playwright 루프는 로컬 dev 서버 연결 문제 때문에 완료하지 못했다. 자동 시나리오 검증은 브라우저 MCP 기준으로 마무리했다.

## 2026-03-29 desktop restart follow-up

- 버그 가설: PC에서 `Restart Run` 후 작은 랜덤 도형이 나오면, 큐 슬롯 전체가 아니라 실제 블록 픽셀 영역에만 `pointerdown`이 걸려 있어서 드래그가 불안정하게 느껴질 수 있었다.
- 구현: Phaser 큐 블록 컨테이너의 인터랙션 영역을 실제 도형 크기 대신 슬롯 전체 크기로 확장했다.
- 검증: `npm run typecheck`, `npm run lint` 재통과.
- 참고: 데스크톱 실제 플레이에서 드래그 시작점은 캔버스 하단 큐이며, 우측 보조 `Queue` 카드 패널은 드래그 소스가 아니라 상태 미리보기다.

## 2026-03-29 desktop queue layering follow-up

- 사용자 피드백: 큐 블록이 너무 쉽게 잡히는 대신, 드래그 시작 순간 블록이 큐 카드 아래에 깔린 것처럼 보여 시각적으로 불안정했다.
- 구현: 큐 블록과 텍스트 depth를 슬롯 배경보다 위로 올리고, 드래그 프리뷰 depth도 상수로 분리해 우선순위를 명확히 했다.
- 구현: 큐 블록 hit area를 슬롯 전체에서 `블록 주변 여유 영역` 수준으로 줄여 빈 영역 클릭으로도 바로 드래그되는 느낌을 완화했다.
- 검증: `npm run typecheck`, `npm run lint` 재통과.

## 2026-03-29 desktop keyboard scroll follow-up

- 사용자 피드백: PC에서 방향키로 보드 커서를 움직일 때 브라우저 스크롤이 같이 반응하는 경우가 있었다.
- 구현: Phaser `keydown` 핸들러에서 실제 게임 조작으로 처리되는 경우에만 방향키와 `Space`의 기본 브라우저 동작을 막도록 조정했다.
- 참고: 텍스트 입력 포커스 상태나 게임오버 상태처럼 게임 키보드 입력을 무시하는 경우에는 기존 브라우저/입력 기본 동작을 유지한다.

## 2026-03-29 overlay cell alignment follow-up

- 사용자 피드백: 배치 가능 위치를 보여주는 overlay는 외곽선은 맞지만 내부 셀 크기가 실제 보드 블록보다 약간 작아 보였다.
- 구현: 보드 본체, ghost overlay, placement feedback가 모두 같은 `BOARD_CELL_INSET`, `BOARD_CELL_DRAW_SIZE`, `BOARD_CELL_RADIUS` 상수를 사용하도록 정리했다.
- 기대 효과: 미리보기 셀과 실제 배치 후 셀의 내부 네모 크기와 라운드가 같은 기준으로 맞춰진다.
