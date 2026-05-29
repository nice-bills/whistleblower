/** Fixed ambient layer: slow orbs + grain. pointer-events-none, honors reduced motion via CSS. */
export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden>
      <div className="ambient-bg__mesh" />
      <div className="ambient-bg__orb ambient-bg__orb--1" />
      <div className="ambient-bg__orb ambient-bg__orb--2" />
      <div className="ambient-bg__orb ambient-bg__orb--3" />
      <div className="ambient-bg__orb ambient-bg__orb--4" />
      <div className="ambient-bg__grain" />
    </div>
  );
}
