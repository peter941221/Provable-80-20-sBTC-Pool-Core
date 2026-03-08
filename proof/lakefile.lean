import Lake
open Lake DSL

package «pool820-proof» where
  moreLeanArgs := #[]

lean_lib Pool820 where
  globs := #[.submodules `Pool820]
