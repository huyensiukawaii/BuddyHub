type ChooseAuthProps = {
  onLogin: () => void
  onRegister: () => void
}

function ChooseAuth({ onLogin, onRegister }: ChooseAuthProps) {
  return (
    <>
      <div className="card-header">
        <h2>Chào mừng đến với BuddyHub</h2>
        <p>Chọn cách bạn muốn tiếp tục để đăng nhập hoặc tạo tài khoản mới.</p>
      </div>

      <div className="choice-grid">
        <button type="button" className="choice-card" onClick={onLogin}>
          <span className="choice-kicker">Đã có tài khoản</span>
          <strong>Đăng nhập</strong>
            <p>Đăng nhập bằng tài khoản email HUST.</p>
        </button>

        <button type="button" className="choice-card" onClick={onRegister}>
          <span className="choice-kicker">Người dùng mới</span>
          <strong>Đăng ký</strong>
          <p>Tạo tài khoản HUST mới và xác thực email theo luồng đã làm trước đó.</p>
        </button>
      </div>
    </>
  )
}

export default ChooseAuth