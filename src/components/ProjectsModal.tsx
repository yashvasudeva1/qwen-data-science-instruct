import React, { useState } from 'react';
import { Project } from '../types';
import {
  X,
  FolderKanban,
  FileText,
  Plus,
  Trash2,
  Check,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updated: Project) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [name, setName] = useState(project.name);
  const [instructions, setInstructions] = useState(project.customInstructions);
  const [files, setFiles] = useState([
    { id: '1', name: 'punk_records_neural_invariants.md', size: '24 KB' },
    { id: '2', name: 'egghead_island_specs.json', size: '12 KB' },
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProject({
      ...project,
      name,
      customInstructions: instructions,
      filesCount: files.length,
    });
    onClose();
  };

  const handleAddFile = () => {
    const fileName = prompt('Enter document name (e.g. system_architecture.md):');
    if (fileName) {
      setFiles((prev) => [
        ...prev,
        { id: String(Date.now()), name: fileName, size: '8 KB' },
      ]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Project Knowledge & Instructions</h2>
              <p className="text-[11px] text-slate-500">Provide Vegapunk with persistent context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Custom Instructions for Vegapunk</span>
              <span className="text-[10px] text-blue-600 font-normal lowercase">applies to all chats</span>
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Always structure technical answers in TypeScript, adhere strictly to zero-pill UI guidelines, and provide practical real-world implementations."
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs leading-relaxed resize-none"
            />
          </div>

          {/* Project Knowledge Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Knowledge Files ({files.length})
              </label>
              <button
                type="button"
                onClick={handleAddFile}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add file</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-mono text-xs truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">({file.size})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsModal;
