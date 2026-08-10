// Stub for the "server-only" marker package. Next vendors its own copy and
// aliases the bare specifier via its webpack config at build time; Vite (and
// therefore Vitest) has no equivalent, and the package isn't an installed
// dependency, so `import "server-only"` fails module resolution under the
// test runner without this. Side-effect-only import, so an empty module is
// a correct stand-in — see vitest.config.ts's resolve.alias.
