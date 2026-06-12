/**
 * Fixed, non-interactive background depth for the whole site: a restrained gold
 * bloom at the top and a faint film grain. Pure CSS so it stays a Server
 * Component and costs nothing on the main thread. Sits at -z-10 under every
 * page; the body keeps its solid paper fill as the base coat.
 */
export function SiteAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="atmos-bloom absolute inset-0" />
      <div className="atmos-grain absolute inset-0" />
    </div>
  );
}
