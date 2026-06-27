import React, { useState } from 'react';
import { PromptStrategy } from '../types';
import { Plus, BookOpen, Layers, Copy, Trash2, Check, Sparkles, X } from 'lucide-react';

interface StrategyLibraryProps {
  strategies: PromptStrategy[];
  onAddStrategy: (newStrategy: PromptStrategy) => void;
  onDeleteStrategy: (id: string) => void;
}

export default function StrategyLibrary({ strategies, onAddStrategy, onDeleteStrategy }: StrategyLibraryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'basic' | 'reasoning' | 'safety' | 'agentic' | 'structured'>('basic');
  const [template, setTemplate] = useState('Task: [TASK_INPUT]\n\nReasoning:\n');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Clipboard state map
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !template.trim()) {
      setError('Name and template are required fields.');
      return;
    }
    if (!template.includes('[TASK_INPUT]')) {
      setError('The prompt template must contain the [TASK_INPUT] placeholder key.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, template })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register custom strategy.');
      }

      onAddStrategy(data);
      setShowAddForm(false);
      // Reset form fields
      setName('');
      setDescription('');
      setCategory('basic');
      setTemplate('Task: [TASK_INPUT]\n\nReasoning:\n');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom strategy? Historical experiments using this strategy will also be cleaned up.')) return;
    try {
      const response = await fetch(`/api/strategies/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete strategy.');
      }
      onDeleteStrategy(id);
    } catch (err: any) {
      alert(err.message || 'Delete operation failed.');
    }
  };

  return (
    <div className="space-y-6" id="strategy-library-workspace">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Prompt Strategy Library</h2>
          <p className="text-sm text-slate-500">Explore predefined scholarly prompt templates or draft new structured instruction scaffolds.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Strategy</span>
        </button>
      </div>

      {/* Grid List of Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="strategies-grid">
        {strategies.map(strat => (
          <div key={strat.id} className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between p-6 hover:border-slate-300 transition-colors">
            <div className="space-y-4">
              
              {/* Category tag & customization badge */}
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  strat.category === 'reasoning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  strat.category === 'agentic' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  strat.category === 'safety' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  strat.category === 'structured' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                  {strat.category}
                </span>
                
                {strat.isCustom && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200 uppercase">
                    Custom
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-1">{strat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-12">{strat.description}</p>
              </div>

              {/* Inner Prompt Display */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold uppercase">
                  <span>Prompt Template Structure</span>
                  <button 
                    onClick={() => handleCopy(strat.id, strat.template)}
                    className="hover:text-blue-600 flex items-center space-x-1 font-sans font-normal text-[10px] uppercase cursor-pointer"
                  >
                    {copiedId === strat.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 h-36 font-mono text-[10px] text-slate-500 overflow-y-auto leading-relaxed select-all whitespace-pre-wrap">
                  {strat.template}
                </div>
              </div>

            </div>

            {/* Strategy Card Footer action */}
            {strat.isCustom && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(strat.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center space-x-1 cursor-pointer font-medium hover:bg-rose-50 px-2 py-1.5 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Custom Scaffold</span>
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Modal Slideover Form for Adding Strategy */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="add-strategy-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Add Custom Prompt Strategy</span>
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <span className="font-bold">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Strategy Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Strategy Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meta-Cognitive Prompting"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="basic">Basic Prompting (Formatting)</option>
                  <option value="reasoning">Logical Reasoning (Inference)</option>
                  <option value="safety">Safety Audit & Alignment</option>
                  <option value="agentic">Agentic Scaffolding (Reflection)</option>
                  <option value="structured">Structured IO (JSON/XML)</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief explanation of the prompt strategy scaffolding principles."
                  rows={2}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              {/* Template Content */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt Scaffold Template</label>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Placeholder required</span>
                </div>
                <textarea 
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={5}
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:border-blue-500 focus:bg-white focus:outline-hidden leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 leading-normal">
                  The template MUST include the string <code className="bg-slate-100 px-1 font-mono text-slate-600 font-bold">[TASK_INPUT]</code> which acts as the dynamic insertion token for the benchmark datasets. You may also use <code className="bg-slate-100 px-1 font-mono text-slate-600">[CONTEXT]</code> or <code className="bg-slate-100 px-1 font-mono text-slate-600">[EXAMPLES]</code>.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 cursor-pointer shadow-xs active:scale-98"
                >
                  {submitting ? 'Registering...' : 'Save Strategy'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
