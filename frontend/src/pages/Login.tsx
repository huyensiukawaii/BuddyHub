import type { FormEvent } from 'react'

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>

type LoginProps = {
  values: LoginValues
  errors: LoginErrors
  loading: boolean
  success: boolean
  message: string
  onChange: (field: keyof LoginValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onViewProfile: () => void
  onGoRegister: () => void
}

function Login({
  values,
  errors,
  loading,
  success,
  message,
  onChange,
  onSubmit,
  onViewProfile,
  onGoRegister,
}: LoginProps) {
  return (
    <>
      <div className="card-header">
        <h2>Đăng nhập</h2>
        <p>Nhập email HUST và mật khẩu để tiếp tục.</p>
      </div>

      {success ? (
        <div className="success-state compact-state">
          <div className="success-mark">✓</div>
          <span className="success-text">Đăng nhập thành công</span>
          <p>{message}</p>

          <button type="button" className="primary-button" onClick={onViewProfile}>
            Xem Profile
          </button>

          <button type="button" className="ghost-button" onClick={onGoRegister}>
            Chuyển sang đăng ký
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <label>
            <span>Email HUST</span>
            <input
              type="email"
              placeholder="ten.ho123456@sis.hust.edu.vn"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={values.password}
              onChange={(event) => onChange('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          {message && <div className="status-banner">{message}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <button type="button" className="secondary-button" onClick={onGoRegister}>
            Chưa có tài khoản? Đăng ký
          </button>
        </form>
      )}
    </>
  )
}

export default Login