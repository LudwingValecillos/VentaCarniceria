import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Edit, Save, Phone, User, Briefcase, ChevronDown } from 'lucide-react';
import { WhatsAppNumber } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  numbers: WhatsAppNumber[];
  onSave: (numbers: WhatsAppNumber[]) => Promise<boolean> | void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  role: string;
  number: string;
}

const ROLE_OPTIONS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'empleado', label: 'Empleado' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'propietario', label: 'Propietario' },
];

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
const ensure549 = (raw: string) => {
  const digits = onlyDigits(raw);
  if (!digits) return '';
  if (digits.startsWith('549')) return digits;
  if (digits.startsWith('54')) return `549${digits.slice(2)}`;
  return `549${digits}`;
};
const isValidPhone = (v: string) => {
  const digits = ensure549(v);
  return /^549\d{7,12}$/.test(digits);
};

export const WhatsAppNumbersModal: React.FC<Props> = ({ isOpen, onClose, numbers, onSave, isLoading }) => {
  const [list, setList] = useState<WhatsAppNumber[]>(numbers);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', role: '', number: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const inputNameRef = useRef<HTMLInputElement | null>(null);
  const inputRoleRef = useRef<HTMLSelectElement | null>(null);
  const inputNumberRef = useRef<HTMLInputElement | null>(null);

  const livePreview = useMemo(() => {
    const normalized = ensure549(formData.number);
    if (!normalized) return '';
    return `https://wa.me/${normalized}`;
  }, [formData.number]);

  const isReady = useMemo(() => {
    return (
      !!formData.name.trim() &&
      !!formData.role.trim() &&
      !!formData.number.trim() &&
      isValidPhone(formData.number)
    );
  }, [formData]);

  useEffect(() => {
    if (!isOpen) return;
    // Focus first missing field for speed
    const nameOk = !!formData.name.trim();
    const roleOk = !!formData.role.trim();
    const numberOk = !!formData.number.trim();
    if (!nameOk && inputNameRef.current) inputNameRef.current.focus();
    else if (!roleOk && inputRoleRef.current) inputRoleRef.current.focus();
    else if (!numberOk && inputNumberRef.current) inputNumberRef.current.focus();
  }, [isOpen, editingIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (editingIndex !== null) {
          reset();
        } else {
          onClose();
        }
      } else if (e.key === 'Enter') {
        const active = document.activeElement as HTMLElement | null;
        const isInput = active && ['INPUT', 'SELECT'].includes(active.tagName);
        if (isInput) {
          e.preventDefault();
          if (editingIndex === null) add(); else applyEdit();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, editingIndex, formData]);

  useEffect(() => setList(numbers), [numbers]);

  const reset = () => { 
    setEditingIndex(null); 
    setFormData({ name: '', role: '', number: '' }); 
    setError(null); 
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.role.trim()) {
      setError('El rol es requerido');
      return false;
    }
    if (!formData.number.trim()) {
      setError('El número es requerido');
      return false;
    }
    if (!isValidPhone(formData.number)) {
      setError('Número inválido. Se normaliza a 549 + número.');
      return false;
    }
    setError(null);
    return true;
  };

  const add = async () => {
    if (!validateForm()) return;
    if (saving) return;
    setSaving(true);
    const newNumber: WhatsAppNumber = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      number: ensure549(formData.number.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const nextList = [...list, newNumber];
    setList(nextList);
    try {
      const ok = await Promise.resolve(onSave(nextList)) as boolean | void;
      if (ok === false) {
        setError('No se pudo guardar el nuevo número');
        // revert local
        setList(list);
        return;
      }
      reset();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (i: number) => { 
    setEditingIndex(i); 
    setFormData({ 
      name: list[i].name, 
      role: list[i].role, 
      number: list[i].number 
    }); 
    setError(null); 
  };

  const applyEdit = async () => {
    if (!validateForm()) return;
    if (editingIndex === null) return;
    if (saving) return;
    setSaving(true);
    const nextList = list.map((n, i) => (
      i === editingIndex
        ? {
            ...n,
            name: formData.name.trim(),
            role: formData.role.trim(),
            number: ensure549(formData.number.trim()),
            updatedAt: new Date(),
          }
        : n
    ));
    const prevList = list;
    setList(nextList);
    try {
      const ok = await Promise.resolve(onSave(nextList)) as boolean | void;
      if (ok === false) {
        setError('No se pudieron guardar los cambios');
        setList(prevList);
        return;
      }
      reset();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (i: number) => {
    const toDelete = list[i];
    const ok = window.confirm(`¿Eliminar a ${toDelete?.name} (${toDelete?.number})?`);
    if (!ok) return;
    if (saving) return;
    setSaving(true);
    const nextList = list.filter((_, idx) => idx !== i);
    const prevList = list;
    setList(nextList);
    try {
      const saved = await Promise.resolve(onSave(nextList)) as boolean | void;
      if (saved === false) {
        setError('No se pudo eliminar el número');
        setList(prevList);
      }
    } finally {
      setSaving(false);
    }
  };
  const saveAll = async () => { 
    try {
      const ok = await onSave(list.map(n => ({ ...n, number: ensure549(n.number) })));
      if (ok !== false) {
        onClose(); 
      }
    } catch (error) {
      // Error al guardar
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-1 md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-full md:max-w-3xl max-h-[90vh] md:max-h-[80vh] overflow-hidden animate-scale-in border border-gray-200 flex flex-col my-2 md:my-0"
        style={{ height: '90vh', maxHeight: '90vh' }}
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div>
                <h2 className="text-base md:text-2xl font-bold font-lobster flex items-center gap-1 md:gap-2">
                  <Phone className="w-4 h-4 md:w-7 md:h-7" />
                  Gestión de Números WhatsApp
                </h2>
                <p className="text-white/90 text-xs md:text-sm">
                  Agrega y gestiona los números de contacto de tu carnicería
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 md:p-2 hover:bg-white/20 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-110"
              aria-label="Cerrar modal de WhatsApp"
            >
              <X className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-6rem)] md:h-[calc(95vh-8rem)]">
          {/* Form Section */}
          <div className="p-2 md:p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nombre</label>
                <div className="relative">
                  <User className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Rol</label>
                <div className="relative">
                  <Briefcase className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    ref={inputRoleRef}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none"
                  >
                    <option value="">Seleccionar rol</option>
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 md:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Número</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputNumberRef}
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="54911XXXXXXXX"
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  />
                  <div className="mt-1 text-[11px] md:text-xs text-gray-500 pl-1">
                    Se guardará como: <span className="font-medium text-gray-700">{ensure549(formData.number) || '—'}</span>
                    {livePreview && (
                      <>
                        {' · '}
                        <a className="text-green-600 hover:underline" href={livePreview} target="_blank" rel="noreferrer">Probar link</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2 mt-3 md:mt-4">
              {editingIndex === null ? (
                <button 
                  onClick={add} 
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-all duration-200 text-sm disabled:opacity-50"
                  disabled={!isReady}
                >
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Agregar
                </button>
              ) : (
                <>
                  <button 
                    onClick={applyEdit} 
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-all duration-200 text-sm disabled:opacity-50"
                    disabled={!isReady}
                  >
                    <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /> Guardar
                  </button>
                  <button 
                    onClick={reset} 
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Numbers List */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                Números Registrados ({list.length})
              </h3>
              <span className="text-xs text-gray-500">Guardado automático {saving || isLoading ? '· Guardando…' : ''}</span>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <Phone className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-500 text-sm">No hay números registrados</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {list.map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">{n.name}</h4>
                        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="capitalize">{n.role}</span>
                        </div>
                        <p className="text-xs md:text-sm text-green-600 font-medium">{ensure549(n.number)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <button 
                        onClick={() => startEdit(i)} 
                        className="px-2 md:px-3 py-1 md:py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-xs"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => remove(i)} 
                        className="px-2 md:px-3 py-1 md:py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: solo cerrar */}
          <div className="border-t border-gray-200 bg-white p-2 md:p-6">
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-3 md:px-4 py-1.5 md:py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppNumbersModal;
