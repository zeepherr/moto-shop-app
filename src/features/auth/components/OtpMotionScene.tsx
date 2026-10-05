import { Check, LockKeyhole, ShieldCheck } from "lucide-react";

export function OtpMotionScene({ verified = false, compact = false }: { verified?: boolean; compact?: boolean }) {
  return (
    <div className={`otp-scene ${compact ? "otp-scene-compact" : ""} ${verified ? "is-verified" : ""}`} aria-hidden="true">
      <span className="otp-scene-orbit otp-scene-orbit-one" />
      <span className="otp-scene-orbit otp-scene-orbit-two" />
      <span className="otp-scene-node otp-scene-node-one" />
      <span className="otp-scene-node otp-scene-node-two" />
      <div className="otp-scene-shield">
        <ShieldCheck className="otp-scene-outline" strokeWidth={1.2} />
        <div className="otp-scene-lock"><LockKeyhole className="otp-lock-icon" strokeWidth={1.7} /><Check className="otp-check-icon" strokeWidth={2.4} /></div>
      </div>
    </div>
  );
}
