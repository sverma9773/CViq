import ClaudeIcon from "./components/ClaudeIcon";

export default function RootLoading() {
  return (
    <div className="cviq-global-loading">
      <div className="cviq-global-loading-bar-wrap">
        <div className="cviq-global-loading-bar"></div>
      </div>
      <div className="cviq-global-loading-content">
        <div className="cviq-global-loading-spinner"></div>
        <ClaudeIcon size={28} color="var(--color-accent)" />
      </div>
    </div>
  );
}
