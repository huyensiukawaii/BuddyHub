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

type ProfileProps = {
  email: string
  profileData: ProfileData | null
  loading: boolean
  error: string
}

function Profile({ email, profileData, loading, error }: ProfileProps) {
  return (
    <>
      <div className="card-header">
        <h2>Profile</h2>
        <p>Thông tin hồ sơ người dùng sau khi xác thực email HUST.</p>
      </div>

      {loading ? (
        <div className="status-banner">Đang tải profile...</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : profileData ? (
        <div className="profile-view">
          <div className="profile-hero-card">
            <img
              className="profile-avatar"
              src={profileData?.avatarUrl}
              alt={`Ảnh đại diện của ${profileData?.name ?? 'người dùng'}`}
            />

            <div className="profile-identity">
              <div className="profile-name-row">
                <h3>{profileData?.name}</h3>
                {profileData?.isVerified && <span className="verified-badge">HUST Verified</span>}
              </div>
              <p>{email}</p>
            </div>
          </div>

          <div className="profile-grid">
            <article className="profile-panel">
              <h4>Thông tin profile</h4>
              <dl>
                <div>
                  <dt>Ngành học</dt>
                  <dd>{profileData?.faculty}</dd>
                </div>
                <div>
                  <dt>Năm học</dt>
                  <dd>{profileData?.schoolYear}</dd>
                </div>
                <div>
                  <dt>Sở thích</dt>
                  <dd>{profileData?.interests.join(', ')}</dd>
                </div>
                <div>
                  <dt>Giới thiệu bản thân</dt>
                  <dd>{profileData?.bio}</dd>
                </div>
              </dl>
            </article>

            <article className="profile-panel">
              <h4>Hoạt động</h4>
              <div className="activity-stats">
                <div>
                  <strong>{profileData?.hostedCount}</strong>
                  <span>Số hoạt động đã tổ chức</span>
                </div>
                <div>
                  <strong>{profileData?.joinedCount}</strong>
                  <span>Số hoạt động đã tham gia</span>
                </div>
              </div>
            </article>
          </div>

        </div>
      ) : (
        <div className="error-banner">Không có dữ liệu profile</div>
      )}
    </>
  )
}

export default Profile