import React, { useState } from 'react';
import { Lock, Heart, KeyRound, User, Sparkles, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sha256, ALLOWED_PASSWORD_HASHES, ALLOWED_USER_HASHES } from '../utils/security';

interface LoginGateProps {
  onSuccess: (user: string) => void;
}

const AUTH_STORAGE_KEY = 'romantic_game_auth_session';
const CUSTOM_PASSWORD_HASH_KEY = 'romantic_game_custom_password_hash';

export const LoginGate: React.FC<LoginGateProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  // Custom secret setting state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [customLogin, setCustomLogin] = useState('');
  const [currentSecret, setCurrentSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeSuccessMsg, setChangeSuccessMsg] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    const cleanPwd = password.trim();

    if (!cleanUser) {
      setError('Пожалуйста, введите имя или логин');
      return;
    }

    if (!cleanPwd) {
      setError('Пожалуйста, введите пароль или код доступа');
      return;
    }

    setIsLoading(true);

    try {
      const userHash = await sha256(cleanUser);
      const inputHash = await sha256(cleanPwd);
      const savedCustomHash = localStorage.getItem(CUSTOM_PASSWORD_HASH_KEY);

      // Check login (must be recognized user or valid session)
      const isRecognizedUser = ALLOWED_USER_HASHES.includes(userHash);
      if (!isRecognizedUser && !savedCustomHash) {
        setError('Пользователь с таким именем/логином не найден в приватном доступе.');
        setIsLoading(false);
        return;
      }

      let isValidPassword = false;
      if (savedCustomHash) {
        // Either matches the custom set hash or any default system hash
        isValidPassword = inputHash === savedCustomHash || ALLOWED_PASSWORD_HASHES.includes(inputHash);
      } else {
        isValidPassword = ALLOWED_PASSWORD_HASHES.includes(inputHash);
      }

      if (isValidPassword) {
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D48166', '#4A6B82', '#E6AF2E', '#F4A261'],
          });
        } catch {
          // ignore
        }

        const sessionPayload = JSON.stringify({
          authenticated: true,
          user: cleanUser,
          timestamp: Date.now(),
        });

        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, sessionPayload);
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, sessionPayload);
        }

        onSuccess(cleanUser);
      } else {
        setError('Неверный код доступа / пароль. Проверьте ввод или откройте подсказку.');
      }
    } catch {
      setError('Ошибка проверки безопасности. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCustomPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    const cleanUser = customLogin.trim();
    const cleanCur = currentSecret.trim();
    const cleanNew = newPassword.trim();

    if (!cleanUser) {
      setChangeError('Введите ваш логин для подтверждения прав');
      return;
    }

    if (!cleanCur) {
      setChangeError('Введите текущий секрет (любой стандартный пароль)');
      return;
    }

    if (!cleanNew || cleanNew.length < 3) {
      setChangeError('Новый секрет должен быть не менее 3 символов');
      return;
    }

    try {
      const userHash = await sha256(cleanUser);
      const curHash = await sha256(cleanCur);
      const savedCustomHash = localStorage.getItem(CUSTOM_PASSWORD_HASH_KEY);

      // Verify user rights
      const isRecognizedUser = ALLOWED_USER_HASHES.includes(userHash);
      if (!isRecognizedUser) {
        setChangeError('Неверный логин. Менять секрет могут только владельцы архива.');
        return;
      }

      // Verify current password knowledge
      const isValidCur = savedCustomHash
        ? curHash === savedCustomHash || ALLOWED_PASSWORD_HASHES.includes(curHash)
        : ALLOWED_PASSWORD_HASHES.includes(curHash);

      if (!isValidCur) {
        setChangeError('Текущий секрет указан неверно.');
        return;
      }

      const newHash = await sha256(cleanNew);
      localStorage.setItem(CUSTOM_PASSWORD_HASH_KEY, newHash);
      setChangeSuccessMsg('Новый секрет успешно сохранён в зашифрованном виде (SHA-256)!');
      setUsername(cleanUser);
      setPassword(cleanNew);
      setIsChangingPassword(false);
      setCustomLogin('');
      setCurrentSecret('');
      setNewPassword('');
      setTimeout(() => setChangeSuccessMsg(null), 5000);
    } catch {
      setChangeError('Ошибка при сохранении секрета.');
    }
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(CUSTOM_PASSWORD_HASH_KEY);
    setChangeSuccessMsg('Сброшено на стандартные секреты архива.');
    setIsChangingPassword(false);
    setCustomLogin('');
    setCurrentSecret('');
    setNewPassword('');
    setTimeout(() => setChangeSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F7F2] text-[#3D3D3D] flex flex-col justify-center items-center p-4 selection:bg-[#D48166] selection:text-white relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4A6B82]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D48166]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E1D8] shadow-xl p-6 sm:p-8 relative z-10">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#D48166]/15 border border-[#D48166]/30 flex items-center justify-center text-[#D48166] mb-3 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A6B82]/10 border border-[#4A6B82]/20 text-[#4A6B82] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Защищённый личный архив
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-[#3D3D3D] tracking-tight">
            История Нашей Любви
          </h1>
          <p className="text-sm text-[#7A756B] mt-1 max-w-xs">
            Введите логин и секретный ключ доступа, чтобы открыть историю
          </p>
        </div>

        {/* Change Password Notification */}
        {changeSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            {changeSuccessMsg}
          </div>
        )}

        {/* Login Form */}
        {!isChangingPassword ? (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756B] mb-1.5">
                Имя / Логин
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39E93]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ваше имя или логин"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#4A6B82] focus:border-transparent transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756B] mb-1.5">
                Секретный код / Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39E93]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите секретный код..."
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#4A6B82] focus:border-transparent transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A39E93] hover:text-[#3D3D3D] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-[#7A756B]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#4A6B82] focus:ring-[#4A6B82] border-[#E5E1D8]"
                />
                <span>Запомнить меня на этом устройстве</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A6B82] hover:bg-[#3D5A6E] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.99] disabled:opacity-70"
            >
              <Heart className="w-4 h-4 fill-current text-[#D48166]" />
              <span>{isLoading ? 'Проверка...' : 'Войти в историю'}</span>
            </button>

            {/* Help & Customization Links */}
            <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#7A756B]">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[#4A6B82] hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Скрыть подсказку' : 'Подсказка к коду'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(true);
                  setChangeError(null);
                }}
                className="text-[#7A756B] hover:text-[#3D3D3D] hover:underline cursor-pointer"
              >
                ⚙️ Свой секрет
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 rounded-xl bg-[#F0EDE6] border border-[#E5E1D8] text-xs text-[#59554D] leading-relaxed space-y-1.5 animate-fadeIn">
                <p className="font-semibold text-[#3D3D3D]">Секретом может быть любой из вариантов:</p>
                <p className="flex items-center gap-1.5">• <strong>0709</strong> (или 07.09 — дата встречи)</p>
                <p className="flex items-center gap-1.5">• <strong>2026</strong> (текущий год)</p>
                <p className="flex items-center gap-1.5">• <strong>любовь</strong> или <strong>love</strong></p>
                <p className="flex items-center gap-1.5">• <strong>кот</strong> или <strong>cat</strong></p>
                <p className="flex items-center gap-1.5">• <strong>1234</strong></p>
                <p className="flex items-center gap-1.5">• Имя одного из вас</p>
              </div>
            )}
          </form>
        ) : (
          /* Set Custom Password Form with Strict Login & Old Secret Verification */
          <form onSubmit={handleSetCustomPassword} className="space-y-3.5">
            <div className="text-center pb-1">
              <h2 className="text-sm font-bold text-[#3D3D3D]">Установка своего секрета</h2>
              <p className="text-xs text-[#7A756B]">Требуется подтверждение логина и текущего секрета</p>
            </div>

            {changeError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {changeError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756B] mb-1">
                1. Ваш логин (Имя)
              </label>
              <input
                type="text"
                value={customLogin}
                onChange={(e) => setCustomLogin(e.target.value)}
                placeholder="Подтвердите ваше имя..."
                className="w-full px-3.5 py-2 bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl text-sm text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#4A6B82]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756B] mb-1">
                2. Текущий секрет
              </label>
              <input
                type="password"
                value={currentSecret}
                onChange={(e) => setCurrentSecret(e.target.value)}
                placeholder="Например, 0709, 2026 или любовь"
                className="w-full px-3.5 py-2 bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl text-sm text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#4A6B82] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756B] mb-1">
                3. Новый секретный пароль
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Придумайте новый код..."
                className="w-full px-3.5 py-2 bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl text-sm text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#4A6B82] font-mono"
              />
              <p className="text-[11px] text-[#A39E93] mt-1 leading-tight">
                Сохраняется в виде безопасного SHA-256 хеша.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#4A6B82] hover:bg-[#3D5A6E] text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                Сохранить секрет
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-3 py-2.5 bg-[#F0EDE6] hover:bg-[#E5E1D8] text-[#7A756B] rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="w-full text-center text-[11px] text-rose-600 hover:underline cursor-pointer pt-1"
            >
              Сбросить на базовые секреты архива
            </button>
          </form>
        )}
      </div>

      {/* Footer text */}
      <div className="mt-6 text-center text-xs text-[#A39E93]">
        Защищённый доступ • Личный архив ❤️
      </div>
    </div>
  );
};
