"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getUserInfo, saveUserInfo, getZodiac } from "@/lib/utils";
import BirthPicker from "@/components/common/BirthPicker";

const SIJI_OPTIONS = [
  { value: "", label: "모르겠어요" },
  { value: "자시(23:00~01:00)", label: "🐀 자시 (23:00~01:00)" },
  { value: "축시(01:00~03:00)", label: "🐂 축시 (01:00~03:00)" },
  { value: "인시(03:00~05:00)", label: "🐅 인시 (03:00~05:00)" },
  { value: "묘시(05:00~07:00)", label: "🐇 묘시 (05:00~07:00)" },
  { value: "진시(07:00~09:00)", label: "🐉 진시 (07:00~09:00)" },
  { value: "사시(09:00~11:00)", label: "🐍 사시 (09:00~11:00)" },
  { value: "오시(11:00~13:00)", label: "🐴 오시 (11:00~13:00)" },
  { value: "미시(13:00~15:00)", label: "🐑 미시 (13:00~15:00)" },
  { value: "신시(15:00~17:00)", label: "🐵 신시 (15:00~17:00)" },
  { value: "유시(17:00~19:00)", label: "🐔 유시 (17:00~19:00)" },
  { value: "술시(19:00~21:00)", label: "🐶 술시 (19:00~21:00)" },
  { value: "해시(21:00~23:00)", label: "🐷 해시 (21:00~23:00)" },
];

export default function UserInfoModal() {
  const { showUserModal, setShowUserModal, pendingAction, setPendingAction, selectedCalendar, setSelectedCalendar } = useAppStore();
  const [name, setName] = useState("");
  const [birthY, setBirthY] = useState("");
  const [birthM, setBirthM] = useState("");
  const [birthD, setBirthD] = useState("");
  const [gender, setGender] = useState("선택안함");
  const [siji, setSiji] = useState("");
  const [job, setJob] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (showUserModal) {
      const u = getUserInfo();
      if (u) {
        setName(u.name);
        const [y, m, d] = u.birthdate.split("-");
        setBirthY(y); setBirthM(m); setBirthD(d);
        setGender(u.gender);
        setSiji(u.siji);
        setJob(u.job);
        setSelectedCalendar(u.calendar || "양력");
      }
    }
  }, [showUserModal, setSelectedCalendar]);

  if (!showUserModal) return null;

  function handleSubmit() {
    if (!name.trim()) { setError("이름을 입력해 주세요"); return; }
    if (!birthY || !birthM || !birthD) { setError("생년월일을 모두 입력해 주세요"); return; }

    const birthdate = `${birthY}-${birthM.padStart(2, "0")}-${birthD.padStart(2, "0")}`;
    saveUserInfo(name.trim(), birthdate, gender, siji, job.trim(), selectedCalendar);
    setShowUserModal(false);
    setError("");

    if (pendingAction) {
      const fn = pendingAction;
      setPendingAction(null);
      fn();
    }
  }

  return (
    <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title font-serif">나의 정보</div>
        <div className="modal-sub">정확한 운세를 위해 기본 정보를 알려주세요</div>

        {error && <div className="um-error">{error}</div>}

        <div className="form-row">
          <div className="form-label">이름 (닉네임)</div>
          <input className="form-input" placeholder="예: 다아라" value={name} onChange={(e) => setName(e.target.value)} maxLength={10} />
        </div>

        <div className="form-row">
          <div className="form-label">생년월일</div>
          <BirthPicker
            value={{ y: birthY, m: birthM, d: birthD }}
            onChange={({ y, m, d }) => { setBirthY(y); setBirthM(m); setBirthD(d); }}
            calendar={selectedCalendar}
          />
          <div className="user-modal-gender" style={{ marginTop: 6 }}>
            <button className={`gender-btn cal-btn ${selectedCalendar === "양력" ? "active" : ""}`} onClick={() => setSelectedCalendar("양력")}>☀️ 양력</button>
            <button className={`gender-btn cal-btn ${selectedCalendar === "음력" ? "active" : ""}`} onClick={() => setSelectedCalendar("음력")}>🌙 음력</button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-label">성별</div>
          <div className="user-modal-gender">
            {["여성", "남성", "선택안함"].map((g) => (
              <button key={g} className={`gender-btn ${gender === g ? "active" : ""}`} onClick={() => setGender(g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-label">태어난 시 (선택)</div>
          <select className="form-input" value={siji} onChange={(e) => setSiji(e.target.value)}>
            {SIJI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="form-row">
          <div className="form-label">직업 (선택)</div>
          <input className="form-input" placeholder="예: 회사원, 학생, 자영업" value={job} onChange={(e) => setJob(e.target.value)} maxLength={20} />
        </div>

        <button className="submit-btn gold-btn" onClick={handleSubmit} style={{ marginTop: 16 }}>
          저장하고 시작하기 ✨
        </button>
      </div>
    </div>
  );
}
