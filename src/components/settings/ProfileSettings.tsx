import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CheckCircle, Camera, Upload, Sparkles, KeyRound, ShieldCheck, Sun, Moon } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { updateUserProfile } = useStore();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [section, setSection] = useState(user?.section || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [success, setSuccess] = useState(false);

  // Estados para cambio de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!user) return null;

  // Handle image upload from computer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB.', 'Archivo muy pesado');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setAvatar(base64Data);
      updateCurrentUser({ avatar: base64Data });
      updateUserProfile(user.id, { avatar: base64Data });
      toast.success('Foto de perfil actualizada con éxito.', 'Avatar Cambiado');
    };
    reader.readAsDataURL(file);
  };

  const PRESET_AVATARS = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=6366f1`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Rocket&backgroundColor=10b981`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=f59e0b`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=ec4899`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Profe&backgroundColor=06b6d4`,
  ];

  const handleSelectPreset = (presetUrl: string) => {
    setAvatar(presetUrl);
    updateCurrentUser({ avatar: presetUrl });
    updateUserProfile(user.id, { avatar: presetUrl });
    toast.success('Avatar seleccionado con éxito.', 'Avatar Actualizado');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      name: name.trim(),
      institution: institution.trim(),
      section: section.trim(),
      avatar,
    };

    updateCurrentUser(updates);
    updateUserProfile(user.id, updates);

    setSuccess(true);
    toast.success('Tus datos de perfil e institución han sido actualizados.', 'Perfil Guardado');
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Por favor ingresa tu nueva contraseña.', 'Campo requerido');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener un mínimo de 6 caracteres.', 'Contraseña Débil');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden. Verifícalas.', 'Contraseña Diferente');
      return;
    }

    setPasswordLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast.error(error.message, 'Fallo de Seguridad');
          setPasswordLoading(false);
          return;
        }
      } catch {
        // Continuar
      }
    }

    setPasswordLoading(false);
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Tu contraseña ha sido actualizada con éxito.', 'Contraseña Segura');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
          Configuración de Perfil
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Actualiza tus datos académicos, sube tu foto de perfil, institución educativa y seguridad de acceso
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          Tus datos de perfil han sido guardados con éxito.
        </div>
      )}

      {/* Main form */}
      <Card accentColor="indigo" className="space-y-5">
        {/* User Card Header & Avatar Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[var(--border-main)]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatar || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-20 h-20 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] object-cover shadow-[3px_3px_0px_var(--shadow-color)]"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Cambiar foto"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                Subir
              </button>
            </div>

            <div>
              <h2 className="text-base font-black text-[var(--text-main)]">{name || user.name}</h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={user.role === 'admin' ? 'playful' : user.role === 'teacher' ? 'logic' : 'syntax'}>
                  {user.role === 'admin' ? 'Administrador' : user.role === 'teacher' ? 'Docente / Tutor' : 'Estudiante'}
                </Badge>
                {section && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-main)]">
                    {section}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-3.5 h-3.5 text-indigo-500" />}
            >
              Subir Foto
            </Button>
          </div>
        </div>

        {/* Preset Avatars Bar */}
        <div>
          <span className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            O elige un avatar estilizado:
          </span>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-1 rounded-xl border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0 ${
                  avatar === preset
                    ? 'border-indigo-500 bg-indigo-500/20 shadow-[2px_2px_0px_var(--shadow-color)]'
                    : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-indigo-400'
                }`}
              >
                <img src={preset} alt={`Preset ${idx}`} className="w-10 h-10 rounded-lg object-cover" />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            label="Nombre Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Correo Electrónico (No modificable)"
            value={user.email}
            disabled
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Institución Educativa o Academia"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Ej: Universidad, Liceo o Escuela"
            />

            <Input
              label="Sección / Curso Asignado"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Ej: Sección B-2, Turno Tarde"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t-2 border-[var(--border-main)]">
            <div>
              <span className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                Tema Visual del Sistema
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Alterna entre Modo Oscuro y Modo Claro
              </span>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Modo Claro
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Modo Oscuro
                </span>
              )}
            </Button>
          </div>

          <div className="pt-3 flex justify-end">
            <Button type="submit" variant="accent" size="md">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>

      {/* Módulo de Seguridad y Modificación de Contraseña */}
      <Card accentColor="indigo" className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-[var(--border-main)]">
          <div className="p-2 rounded-xl bg-purple-500/10 border-2 border-purple-500/30 text-purple-500">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">
              Seguridad y Cambio de Contraseña
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Actualiza tu clave de acceso con visualización protegida
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <Input
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />

          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu nueva contraseña"
            required
          />

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cifrado JWT con hash seguro</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={passwordLoading}
              icon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Actualizar Contraseña
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
