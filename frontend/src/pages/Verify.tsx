import type { FormEvent } from 'react'

type VerifyProps = {
  email: string
  otp: string
  error: string
  loading: boolean
  resendLoading: boolean
  onOtpChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onResend: () => void
  onBack: () => void
}

function Verify({
  email,
  otp,
  error,
  loading,
  resendLoading,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}: VerifyProps) {
  return (
    <>
      <div className="card-header">
        <h2>Xác thực email HUST</h2>
        <p>
          Mã OTP đã được gửi đến <strong>{email}</strong>. Nhập mã hoặc mở email để hoàn tất xác
          thực.
        </p>
      </div>

      <div className="email-summary">
        <span>Email vừa đăng ký</span>
        <strong>{email}</strong>
      </div>

      <div className="verify-guide">
        <h3>Hướng dẫn</h3>
        <ul>
          <li>Mở email HUST và tìm thư xác thực BuddyHub.</li>
          <li>Sao chép mã OTP 6 chữ số hoặc làm theo link nếu email có cung cấp.</li>
          <li>Nhập mã vào ô bên dưới rồi bấm Xác thực.</li>
        </ul>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>Mã OTP</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Nhập 6 chữ số"
            value={otp}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, '').slice(0, 6)
              onOtpChange(nextValue)
            }}
            aria-invalid={Boolean(error)}
          />
        </label>

        {error && <div className="error-banner">{error}</div>}

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>

          <button type="button" className="secondary-button" onClick={onResend} disabled={resendLoading}>
            {resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã'}
          </button>
        </div>

        <button type="button" className="ghost-button" onClick={onBack}>
          Quay lại
        </button>
      </form>
    </>
  )
}

export default Verify