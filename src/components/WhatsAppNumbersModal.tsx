import React, { useEffect, useState } from 'react';
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

const isValidPhone = (v: string) => /^\+?[1-9]\d{6,14}$/.test(v.replace(/\s|-/g, ''));

export const WhatsAppNumbersModal: React.FC<Props> = ({ isOpen, onClose, numbers, onSave, isLoading }) => {
  const [list, setList] = useState<WhatsAppNumber[]>(numbers);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', role: '', number: '' });
  const [error, setError] = useState<string | null>(null);

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
      setError('Número inválido (usa formato +549...)');
      return false;
    }
    setError(null);
    return true;
  };

  const add = () => {
    if (!validateForm()) return;
    
    const newNumber: WhatsAppNumber = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      number: formData.number.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setList(prev => [...prev, newNumber]); 
    reset();
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

  const applyEdit = () => {
    if (!validateForm()) return;
    if (editingIndex === null) return;
    
    setList(prev => prev.map((n, i) => 
      i === editingIndex 
        ? { 
            ...n, 
            name: formData.name.trim(),
            role: formData.role.trim(),
            number: formData.number.trim(),
            updatedAt: new Date()
          }
        : n
    ));
    reset();
  };

  const remove = (i: number) => setList(prev => prev.filter((_, idx) => idx !== i));
  const saveAll = async () => { 
    try {
      console.log('💾 Modal: Iniciando guardado de números:', list);
      const ok = await onSave(list); 
      if (ok !== false) {
        console.log('✅ Modal: Números guardados exitosamente');
        onClose(); 
      } else {
        console.error('❌ Modal: Error al guardar los números');
      }
    } catch (error) {
      console.error('❌ Modal: Error inesperado al guardar:', error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-full md:max-w-3xl max-h-[90vh] md:max-h-[80vh] overflow-hidden animate-scale-in border border-gray-200 flex flex-col"
        style={{ height: '90vh', maxHeight: '90vh' }}
      >
        {/* Header - Consistente con otros modales */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-3 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg md:text-2xl font-bold font-lobster flex items-center gap-1.5 md:gap-2">
                  <Phone className="w-5 h-5 md:w-7 md:h-7" />
                  Gestión de Números WhatsApp
                </h2>
                <p className="text-white/90 text-xs md:text-sm">
                  Agrega y gestiona los números de contacto de tu carnicería
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-110"
              aria-label="Cerrar modal de WhatsApp"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(95vh-8rem)]">
          {/* Form Section */}
          <div className="p-3 md:p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none"
                  >
                    <option value="">Seleccionar rol</option>
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="+54 9 11 1234 5678"
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {editingIndex === null ? (
                <button 
                  onClick={add} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              ) : (
                <>
                  <button 
                    onClick={applyEdit} 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" /> Guardar
                  </button>
                  <button 
                    onClick={reset} 
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Numbers List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Números Registrados ({list.length})
              </h3>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No hay números registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{n.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span className="capitalize">{n.role}</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">{n.number}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(i)} 
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => remove(i)} 
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white p-3 md:p-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                Cancelar
              </button>
              <button 
                disabled={isLoading} 
                onClick={saveAll} 
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
              >
                <Save className="w-4 h-4" /> 
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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
