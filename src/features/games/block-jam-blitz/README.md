# Block Jam Blitz

- board logic
- combo scoring
- Phaser scene and game-specific HUD copy

## Dev loop

- Base route: `/game/block-jam-blitz`
- Automation route: `/game/block-jam-blitz?automation=1&scenario=start|midgame|game-over`
- Text hook: `window.render_game_to_text()`
- Time hook: `window.advanceTime(ms)`
- Keyboard loop: `Arrow` keys move the cursor, `A`/`B` cycle queue pieces, `Enter` or `Space` places the selected piece

## Commands

- `npm run test:block-jam:loop`
- `npm run test:block-jam:loop -- --scenario start`
- `npm run test:block-jam:loop -- --scenario game-over`
- `npm run test:block-jam:loop:headed -- --scenario midgame`

## Notes

- The local Playwright wrapper copies the shared `develop-web-game` client into `scripts/.generated/` so it can resolve the repo-local `playwright` package.
- In this environment the test URL should use `http://localhost:3001`, not `127.0.0.1`.
- If click focusing becomes flaky, run the loop with `BLOCK_JAM_CLICK_SELECTOR=none`.
- Automation mode hides the global site chrome so the generated screenshots stay focused on the Phaser surface and queue summary.
