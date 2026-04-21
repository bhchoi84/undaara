"use client";

import { useAppStore } from "@/lib/store";
import { loginWithKakao, loginWithGoogle } from "@/lib/supabase";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useAppStore();

  if (!showLoginModal) return null;

  async function handleKakao() {
    try { await loginWithKakao(); }
    catch (e) { alert("카카오 로그인 중 오류가 생겼어요"); }
  }

  async function handleGoogle() {
    try { await loginWithGoogle(); }
    catch (e) { alert("구글 로그인 중 오류가 생겼어요"); }
  }

  return (
    <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
      <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title font-serif">로그인</div>
        <div className="modal-sub">로그인하면 다른 기기에서도 같은 기록으로 이용할 수 있어요</div>

        <button className="social-btn kakao-btn" onClick={handleKakao}>
          <span className="social-icon">💬</span>
          카카오로 시작하기
        </button>
        <button className="social-btn google-btn" onClick={handleGoogle}>
          <span className="social-icon">G</span>
          Google로 시작하기
        </button>

        <button className="modal-close" onClick={() => setShowLoginModal(false)}>닫기</button>
      </div>
    </div>
  );
}
