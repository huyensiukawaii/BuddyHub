import type { FormEvent } from 'react'

type RegisterValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type FieldErrors = Partial<Record<keyof RegisterValues, string>>

type RegisterProps = {
  values: RegisterValues
  errors: FieldErrors
  loading: boolean
  status: string
  onChange: (field: keyof RegisterValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function Register({ values, errors, loading, status, onChange, onSubmit }: RegisterProps) {
  return (
    <>
      <div className="card-header">
        <h2>Đăng ký tài khoản</h2>
        <p>Nhập đầy đủ thông tin để hệ thống gửi mã xác thực đến email HUST của bạn.</p>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>Tên người dùng</span>
          <input
            type="text"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

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

        <div className="field-grid">
          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              value={values.password}
              onChange={(event) => onChange('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          <label>
            <span>Nhập lại mật khẩu</span>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={values.confirmPassword}
              onChange={(event) => onChange('confirmPassword', event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </label>
        </div>

        {status && <div className="status-banner">{status}</div>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Đang gửi mã...' : 'Đăng ký'}
        </button>
      </form>
    </>
  )
}

export default Register