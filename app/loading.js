import ClaudeIcon from "./components/ClaudeIcon";

export default function RootLoading() {
  return (
    <div className="cviqly-global-loading">
      <div className="cviqly-global-loading-bar-wrap">
        <div className="cviqly-global-loading-bar"></div>
      </div>
      <div className="cviqly-global-loading-content">
        <div className="cviqly-global-loading-spinner"></div>
        <ClaudeIcon size={28} color="var(--color-accent)" />
      </div>
    </div>
  );
}
