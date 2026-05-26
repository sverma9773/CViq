import ClaudeIcon from "./ClaudeIcon";

export default function TransitionLoader({ active }) {
  if (!active) return null;

  return (
    <div className="cviqly-star-transition">
      <div className="cviqly-star-wrapper">
        <ClaudeIcon size={40} className="cviqly-star-icon" />
      </div>
    </div>
  );
}
