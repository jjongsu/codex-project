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
