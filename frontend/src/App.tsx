import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import api from './lib/axios'
import ChooseAuth from './pages/ChooseAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import './App.css'
 
const HUST_EMAIL_SUFFIX = '@sis.hust.edu.vn'
const HUST_LOCAL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+\d{6,7}$/

type Screen = 'register' | 'verify' | 'success' | 'profile'

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>

type RegisterValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type FieldErrors = Partial<Record<keyof RegisterValues, string>>

type PendingRegistration = {
  name: string
  email: string
  password: string
}

type VerifiedUser = {
  name: string
  email: string
}

type ProfileData = {
  avatarUrl: string
  name: string
  faculty: string
  schoolYear: string
  interests: string[]
  bio: string
  hostedCount: number
  joinedCount: number
  isVerified: boolean
}

type JwtPayload = {
  sub?: string
  email?: string
}

type CachedProfile = {
  email: string
  profile: ProfileData
}

const PROFILE_CACHE_KEY = 'buddyhub_profile_cache'

const initialRegisterValues: RegisterValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const initialLoginValues: LoginValues = {
  email: '',
  password: '',
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidHustEmail(email: string) {
  const normalized = normalizeEmail(email)

  if (!normalized.endsWith(HUST_EMAIL_SUFFIX)) return false

  const localPart = normalized.split('@')[0]
  return HUST_LOCAL_REGEX.test(localPart)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message

    if (Array.isArray(responseMessage) && responseMessage.length > 0) {
      return String(responseMessage[0])
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage
    }

    if (typeof error.response?.data?.error === 'string') {
      return error.response.data.error
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function validateRegister(values: RegisterValues) {
  const errors: FieldErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Vui lòng nhập tên người dùng'
  } else if (values.name.trim().length < 2) {
    errors.name = 'Tên phải có ít nhất 2 ký tự'
  }

  if (!values.email.trim()) {
    errors.email = 'Vui lòng nhập email HUST'
  } else if (!isValidHustEmail(values.email)) {
    errors.email = 'Email HUST không đúng định dạng. Ví dụ: huyen.dnk225726@sis.hust.edu.vn'
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu'
  } else if (values.password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
  } else if (!/^(?=.*[A-Z])(?=.*\d).+$/.test(values.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp'
  }

  return errors
}

function validateOtp(otp: string) {
  if (!otp.trim()) return 'Vui lòng nhập mã OTP'
  if (!/^\d{6}$/.test(otp.trim())) return 'OTP phải đúng 6 chữ số'
  return ''
}

function validateLogin(values: LoginValues) {
  const errors: LoginErrors = {}

  if (!values.email.trim()) {
    errors.email = 'Vui lòng nhập email HUST'
  } else if (!isValidHustEmail(values.email)) {
    errors.email = 'Email HUST không đúng định dạng'
  }

  if (!values.password.trim()) {
    errors.password = 'Vui lòng nhập mật khẩu'
  }

  return errors
}

function createProfileData(user: VerifiedUser | null): ProfileData | null {
  if (!user) return null

  return {
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    name: user.name,
    faculty: 'Công nghệ thông tin',
    schoolYear: 'Năm 3',
    interests: ['Lập trình', 'Thiết kế sản phẩm', 'Thể thao'],
    bio:
      'Sinh viên HUST yêu thích tổ chức hoạt động kết nối cộng đồng, học tập và chia sẻ kinh nghiệm.',
    hostedCount: 12,
    joinedCount: 27,
    isVerified: true,
  }
}

function decodeJwtPayload(token: string) {
  const payloadPart = token.split('.')[1]
  if (!payloadPart) return null

  const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  try {
    return JSON.parse(atob(padded)) as JwtPayload
  } catch {
    return null
  }
}

function readCachedProfile(expectedEmail: string) {
  try {
    const rawValue = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!rawValue) return null

    const parsed = JSON.parse(rawValue) as CachedProfile
    if (!parsed?.email || parsed.email !== expectedEmail || !parsed.profile) {
      return null
    }

    return parsed.profile
  } catch {
    return null
  }
}

function writeCachedProfile(email: string, profile: ProfileData) {
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ email, profile }))
}

function App() {
  const pathname = window.location.pathname
  const isHomePage = pathname === '/' || pathname === '/auth'
  const isRegisterPage = pathname === '/register'
  const isLoginPage = pathname === '/login'
  const isStandaloneProfilePage = pathname === '/profile'
  const [screen, setScreen] = useState<Screen>('register')
  const [registerValues, setRegisterValues] = useState<RegisterValues>(initialRegisterValues)
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({})
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerStatus, setRegisterStatus] = useState('')

  const [loginValues, setLoginValues] = useState<LoginValues>(initialLoginValues)
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({})
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')

  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null)
  const [otp, setOtp] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
  const [profileError, setProfileError] = useState('')
  const [standaloneProfileData, setStandaloneProfileData] = useState<ProfileData | null>(null)
  const [standaloneProfileEmail, setStandaloneProfileEmail] = useState('')
  const [standaloneProfileLoading, setStandaloneProfileLoading] = useState(false)

  const profileData = createProfileData(verifiedUser)
  const currentProfileEmail = standaloneProfileEmail || verifiedUser?.email || ''

  useEffect(() => {
    if (!isStandaloneProfilePage) {
      return
    }

    let cancelled = false

    const loadProfile = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        if (cancelled) return

        setStandaloneProfileData(null)
        setStandaloneProfileEmail('')
        setProfileError('Bạn cần đăng nhập để xem profile')
        return
      }

      const payload = decodeJwtPayload(token)
      if (!payload?.sub) {
        if (cancelled) return

        setStandaloneProfileData(null)
        setStandaloneProfileEmail('')
        setProfileError('Phiên đăng nhập không hợp lệ')
        return
      }

      setStandaloneProfileLoading(true)
      setProfileError('')

      if (payload.email) {
        const cachedProfile = readCachedProfile(payload.email)
        if (cachedProfile) {
          setStandaloneProfileData(cachedProfile)
          setStandaloneProfileEmail(payload.email)
        }
      }

      try {
        const response = await api.get(`/users/${payload.sub}/profile`)
        const profile = response.data?.profile as ProfileData | undefined

        if (cancelled) return

        if (!profile) {
          throw new Error('Không nhận được dữ liệu profile từ máy chủ')
        }

        setStandaloneProfileData(profile)
        setStandaloneProfileEmail(payload.email ?? '')
        if (payload.email) {
          writeCachedProfile(payload.email, profile)
        }
      } catch (error) {
        if (cancelled) return

        setStandaloneProfileData(null)
        setStandaloneProfileEmail(payload.email ?? '')
        setProfileError(getErrorMessage(error, 'Không tải được profile'))
      } finally {
        if (!cancelled) {
          setStandaloneProfileLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [isStandaloneProfilePage])

  const updateRegisterValue = (field: keyof RegisterValues, value: string) => {
    setRegisterValues((current) => ({ ...current, [field]: value }))

    if (registerErrors[field]) {
      setRegisterErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }

    if (registerStatus) {
      setRegisterStatus('')
    }
  }

  const updateLoginValue = (field: keyof LoginValues, value: string) => {
    setLoginValues((current) => ({ ...current, [field]: value }))

    if (loginErrors[field]) {
      setLoginErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }

    if (loginMessage) {
      setLoginMessage('')
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateRegister(registerValues)
    setRegisterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setRegisterLoading(true)
    setRegisterStatus('')

    const normalizedEmail = normalizeEmail(registerValues.email)

    try {
      await api.post('/auth/send-otp', {
        email: normalizedEmail,
      })

      setPendingRegistration({
        name: registerValues.name.trim(),
        email: normalizedEmail,
        password: registerValues.password,
      })
      setOtp('')
      setVerifyError('')
      setScreen('verify')
      setRegisterStatus('Đã gửi mã xác thực đến email HUST của bạn')
    } catch (error) {
      setRegisterStatus(getErrorMessage(error, 'Gửi mã xác thực thất bại'))
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateLogin(loginValues)
    setLoginErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setLoginLoading(true)
    setLoginMessage('')
    setLoginSuccess(false)

    try {
      const response = await api.post('/auth/login', {
        email: normalizeEmail(loginValues.email),
        password: loginValues.password,
      })

      const accessToken = response.data?.accessToken
      if (typeof accessToken === 'string' && accessToken.trim()) {
        localStorage.setItem('access_token', accessToken)
      }

      window.location.pathname = '/profile'
    } catch (error) {
      setLoginMessage(getErrorMessage(error, 'Đăng nhập thất bại'))
    } finally {
      setLoginLoading(false)
    }
  }

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!pendingRegistration) {
      setVerifyError('Thiếu thông tin đăng ký, vui lòng quay lại màn đăng ký')
      return
    }

    const otpError = validateOtp(otp)
    if (otpError) {
      setVerifyError(otpError)
      return
    }

    setVerifyLoading(true)
    setVerifyError('')

    try {
      const verifyResponse = await api.post('/auth/verify-otp', {
        email: pendingRegistration.email,
        otp: otp.trim(),
      })

      const tempToken = verifyResponse.data?.tempToken

      if (!tempToken) {
        throw new Error('Không nhận được tempToken từ máy chủ')
      }

      const registerResponse = await api.post('/auth/register', {
        name: pendingRegistration.name,
        password: pendingRegistration.password,
        tempToken,
      })

      const accessToken = registerResponse.data?.accessToken
      if (typeof accessToken === 'string' && accessToken.trim()) {
        localStorage.setItem('access_token', accessToken)
      }

      setVerifiedUser({
        name: pendingRegistration.name,
        email: pendingRegistration.email,
      })
      setScreen('success')
      setVerifyError('')
    } catch (error) {
      setVerifyError(getErrorMessage(error, 'Xác thực OTP thất bại'))
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!pendingRegistration) {
      setVerifyError('Thiếu email đăng ký, vui lòng quay lại màn đăng ký')
      return
    }

    setResendLoading(true)
    setVerifyError('')

    try {
      await api.post('/auth/send-otp', {
        email: pendingRegistration.email,
      })

      setRegisterStatus('Đã gửi lại mã xác thực mới')
    } catch (error) {
      setVerifyError(getErrorMessage(error, 'Gửi mã xác thực thất bại'))
    } finally {
      setResendLoading(false)
    }
  }

  const goBackToRegister = () => {
    setScreen('register')
    setVerifyError('')
    setRegisterStatus('')
    setOtp('')
  }

  const goToRegister = () => {
    window.location.pathname = '/register'
  }

  const goToLogin = () => {
    window.location.pathname = '/login'
  }
  if (isHomePage) {
    return (
      <main className="auth-app">
        <section className="auth-shell auth-shell-center">
          <section className="auth-card auth-card-center" aria-live="polite">
            <div className="auth-logo-block" aria-hidden="true">
              <div className="auth-logo-mark">BH</div>
              <div>
                <p className="auth-logo-name">BuddyHub</p>
              </div>
            </div>

            <ChooseAuth onLogin={goToLogin} onRegister={goToRegister} />
          </section>
        </section>
      </main>
    )
  }

  if (isLoginPage) {
    return (
      <main className="auth-app">
        <section className="auth-shell auth-shell-center">
          <section className="auth-card auth-card-center" aria-live="polite">
            <Login
              values={loginValues}
              errors={loginErrors}
              loading={loginLoading}
              success={loginSuccess}
              message={loginMessage}
              onChange={updateLoginValue}
              onSubmit={handleLoginSubmit}
              onViewProfile={() => {
                window.location.pathname = '/profile'
              }}
              onGoRegister={goToRegister}
            />
          </section>
        </section>
      </main>
    )
  }

  if (isRegisterPage) {
    return (
      <main className="auth-app">
        <section className="auth-shell auth-shell-center">
          <section className="auth-card auth-card-center" aria-live="polite">
            <Register
              values={registerValues}
              errors={registerErrors}
              loading={registerLoading}
              status={registerStatus}
              onChange={updateRegisterValue}
              onSubmit={handleRegisterSubmit}
            />

            <button type="button" className="secondary-button auth-footer-button" onClick={goToLogin}>
              Đã có tài khoản? Đăng nhập
            </button>
          </section>
        </section>
      </main>
    )
  }

  if (isStandaloneProfilePage) {
    return (
      <main className="auth-app">
        <section className="auth-shell auth-shell-center profile-shell">
          <section className="auth-card auth-card-center" aria-live="polite">
            <Profile
              email={standaloneProfileEmail}
              profileData={standaloneProfileData}
              loading={standaloneProfileLoading}
              error=""
            />
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-app">
      <section className="auth-shell">
        <aside className="auth-hero">
          <div className="hero-badge">BuddyHub</div>
          <h1>Đăng ký tài khoản và xác thực email HUST</h1>
          <p>
            Tạo tài khoản bằng email sinh viên HUST, nhận mã OTP qua email và hoàn tất xác thực
            trong một luồng liền mạch.
          </p>

          <div className="hero-points">
            <div>
              <strong>1</strong>
              <span>Đăng ký thông tin</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Nhập OTP từ email</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Nhận badge HUST Verified</span>
            </div>
          </div>

          <div className="hero-note">
            Email hợp lệ phải có đuôi <span>@sis.hust.edu.vn</span>.
          </div>
        </aside>

        <section className="auth-card" aria-live="polite">
          {screen === 'register' && (
            <Register
              values={registerValues}
              errors={registerErrors}
              loading={registerLoading}
              status={registerStatus}
              onChange={updateRegisterValue}
              onSubmit={handleRegisterSubmit}
            />
          )}

          {screen === 'verify' && (
            <Verify
              email={pendingRegistration?.email ?? ''}
              otp={otp}
              error={verifyError}
              loading={verifyLoading}
              resendLoading={resendLoading}
              onOtpChange={setOtp}
              onSubmit={handleVerifySubmit}
              onResend={handleResendCode}
              onBack={goBackToRegister}
            />
          )}

          {screen === 'success' && (
            <div className="success-state">
              <div className="success-mark">✓</div>
              <span className="success-text">Xác thực email thành công</span>
              <p>
                Tài khoản <strong>{verifiedUser?.email}</strong> đã được xác thực và sẵn sàng sử
                dụng.
              </p>

              <div className="profile-card">
                <div>
                  <span className="profile-label">Hồ sơ người dùng</span>
                  <strong>{verifiedUser?.name}</strong>
                  <small>{verifiedUser?.email}</small>
                </div>

                <span className="verified-badge">HUST Verified</span>
              </div>

              <button type="button" className="secondary-button" onClick={goBackToRegister}>
                Đăng ký tài khoản khác
              </button>
            </div>
          )}

          {screen === 'profile' && (
            <Profile
              email={currentProfileEmail}
              profileData={profileData}
              loading={false}
              error={profileError}
            />
          )}
        </section>
      </section>
    </main>
  )
}

export default App
