import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Camera, Loader2, ShieldCheck, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton, SoftCard, NeuAlert } from '../components/ui';
import { AppTab, Hazard, InventoryItem } from '../types';
import { useAppContext } from '../context/AppContext';
import { analyzeHazard } from '../services/geminiService';
import { format } from 'date-fns';

export default function TrackerView() {
  const { state, dispatch } = useAppContext();
  const hazards = state.data.hazards;
  const inventory = state.data.inventory;

  const [activeTab, setActiveTab] = useState<'hazards' | 'inventory'>('hazards');
  const [analyzing, setAnalyzing] = useState(false);
  const [addingInventory, setAddingInventory] = useState(false);
  const [invForm, setInvForm] = useState({ room: '', item: '', condition: 'Good', notes: '', photo: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const invFileRef = useRef<HTMLInputElement>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  const handleCaptureHazard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await analyzeHazard(base64);
      const newHazard: Hazard = {
        id: Date.now().toString(),
        type: res.type,
        description: res.description,
        severity: res.severity as any,
        dateReported: Date.now(),
        status: 'Reported'
      };
      dispatch({ type: 'ADD_HAZARD', payload: newHazard });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          title: `Hazard: ${res.type}`,
          time: Date.now(),
          iconName: 'AlertTriangle',
          color: 'text-neone-red'
        }
      });
      dispatch({ type: 'SET_ACTIVE_TAB', payload: AppTab.OVERVIEW });
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureInventory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setInvForm({ ...invForm, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const submitInventory = () => {
    if (!invForm.room || !invForm.item) return;
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      room: invForm.room,
      item: invForm.item,
      condition: invForm.condition,
      notes: invForm.notes,
      photos: invForm.photo ? [invForm.photo] : [],
      dateAdded: Date.now()
    };
    dispatch({ type: 'ADD_INVENTORY', payload: newItem });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now().toString(),
        title: `Inventory: ${invForm.item}`,
        time: Date.now(),
        iconName: 'Camera',
        color: 'text-neone-green'
      }
    });
    setAddingInventory(false);
    setInvForm({ room: '', item: '', condition: 'Good', notes: '', photo: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Property Tracker</h2>
        {activeTab === 'hazards' ? (
          <NeuButton variant="danger" className="h-10 px-4 text-xs" onClick={() => fileRef.current?.click()}>+ Log Hazard</NeuButton>
        ) : (
          <NeuButton className="h-10 px-4 text-xs bg-neone-blue" onClick={() => setAddingInventory(true)}>+ Add Item</NeuButton>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={handleCaptureHazard} />
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
        <button onClick={() => setActiveTab('hazards')} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'hazards' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <AlertTriangle size={14} /> Hazards
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <Camera size={14} /> Inventory
        </button>
      </div>

      {activeTab === 'hazards' ? (
        <>
          <NeuAlert type="info" title="Awaab's Law Tracking">
            Reported issues trigger a legal 14-day mandatory fix window for landlords.
          </NeuAlert>

          {analyzing && (
            <SoftCard className="flex flex-col items-center gap-3 py-12 justify-center border-neone-red/20 border-2 border-dashed">
               <Loader2 className="animate-spin text-neone-red w-8 h-8" />
               <p className="text-sm font-bold text-gray-600">Analyzing Hazard Severity...</p>
            </SoftCard>
          )}

          <div className="space-y-4">
            {hazards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                 <ShieldCheck size={48} className="text-gray-300 mb-4" />
                 <p className="text-sm font-bold text-gray-500">No active hazards.</p>
                 <p className="text-xs text-gray-400 mt-1">Your home environment is safe.</p>
              </div>
            ) : hazards.map(h => (
              <SoftCard key={h.id}>
                 <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${h.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{h.severity}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Clock size={10} /> {format(h.dateReported, 'dd MMM')}</span>
                 </div>
                 <h3 className="font-bold text-lg mb-2">{h.type}</h3>
                 <p className="text-xs text-gray-500 mb-5 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{h.description}</p>
                 <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                       <span>Progress</span>
                       <span>40%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-full bg-neone-red" />
                    </div>
                 </div>
                 <NeuButton variant="secondary" className="w-full py-2.5 text-xs h-auto" onClick={() => setSelectedHazard(h)}>View Legal Timeline</NeuButton>
              </SoftCard>
            ))}
          </div>

          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {selectedHazard && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSelectedHazard(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-bold text-xl">Legal Timeline</h3>
                      <button onClick={() => setSelectedHazard(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-neone-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Clock size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Hazard Reported</div>
                            <time className="text-[10px] font-medium text-neone-blue">{format(selectedHazard.dateReported, 'dd MMM yyyy')}</time>
                          </div>
                          <div className="text-xs text-gray-500">You logged the hazard: {selectedHazard.type}.</div>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <AlertTriangle size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm opacity-60">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Landlord Response Required</div>
                            <time className="text-[10px] font-medium text-gray-400">Within 14 Days</time>
                          </div>
                          <div className="text-xs text-gray-500">Under Awaab's Law, the landlord must investigate within 14 days.</div>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm opacity-60">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Repairs Completed</div>
                            <time className="text-[10px] font-medium text-gray-400">Pending</time>
                          </div>
                          <div className="text-xs text-gray-500">The hazard must be fixed within a reasonable timeframe.</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <NeuButton className="w-full bg-black dark:bg-white text-white dark:text-black" onClick={() => setSelectedHazard(null)}>Close</NeuButton>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      ) : (
        <>
          {addingInventory ? (
            <SoftCard className="space-y-4">
              <h3 className="font-bold text-sm">Add Inventory Item</h3>
              <div className="space-y-3">
                <input type="text" value={invForm.room} onChange={e => setInvForm({...invForm, room: e.target.value})} placeholder="Room (e.g. Kitchen)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
                <input type="text" value={invForm.item} onChange={e => setInvForm({...invForm, item: e.target.value})} placeholder="Item (e.g. Oven)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
                <select value={invForm.condition} onChange={e => setInvForm({...invForm, condition: e.target.value})} className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                  <option>Damaged</option>
                </select>
                <textarea value={invForm.notes} onChange={e => setInvForm({...invForm, notes: e.target.value})} placeholder="Notes (e.g. Scratch on left side)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-20 focus:ring-2 focus:ring-neone-blue resize-none" />

                <div className="flex items-center gap-2">
                  <button onClick={() => invFileRef.current?.click()} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <Camera size={16} /> {invForm.photo ? 'Change Photo' : 'Take Photo'}
                  </button>
                  <input ref={invFileRef} type="file" accept="image/*" className="hidden" onChange={handleCaptureInventory} />
                </div>
                {invForm.photo && (
                  <div className="w-full h-32 rounded-xl overflow-hidden">
                    <img src={invForm.photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <NeuButton variant="secondary" className="flex-1" onClick={() => setAddingInventory(false)}>Cancel</NeuButton>
                <NeuButton className="flex-1 bg-neone-blue" onClick={submitInventory}>Save Item</NeuButton>
              </div>
            </SoftCard>
          ) : (
            <div className="space-y-4">
              <NeuAlert type="success" title="Deposit Protection">
                Documenting condition on move-in prevents unfair deductions later.
              </NeuAlert>
              {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                   <Camera size={48} className="text-gray-300 mb-4" />
                   <p className="text-sm font-bold text-gray-500">No inventory items.</p>
                   <p className="text-xs text-gray-400 mt-1">Start documenting your property.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                      {item.photos[0] ? (
                        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700">
                          <img src={item.photos[0]} alt={item.item} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Camera size={24} className="text-gray-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-neone-blue uppercase">{item.room}</p>
                        <p className="text-sm font-bold truncate">{item.item}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{item.condition}</span>
                          <span className="text-[10px] text-gray-400">{format(item.dateAdded, 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
