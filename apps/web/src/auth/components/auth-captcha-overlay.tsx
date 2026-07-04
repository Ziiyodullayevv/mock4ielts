export function AuthCaptchaOverlay() {
  return (
    <div className="invisible fixed inset-0 z-1000 flex items-center justify-center bg-[#04061e]">
      <div
        id="aws-captcha-container"
        className="rounded-4xl bg-white p-4"
        style={{ minHeight: '200px', minWidth: '320px', position: 'relative' }}
      />
    </div>
  );
}
