import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  HardDrive,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { exportStateAsJSON } from '../../state/storage';
import { validateAppStateSchema, validateAmount } from '../../domain/financeValidation';

export const SettingsPage: React.FC = () => {
  const { state, updateConfig, resetToSampleData, loadStateFromImport } = useFinance();

  const [budgetInput, setBudgetInput] = useState(String(state.config.startingBudget));
  const [bufferInput, setBufferInput] = useState(String(state.config.emergencyBufferGoal));
  const [daysInput, setDaysInput] = useState(String(state.config.totalDays));
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Reset Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Import Status
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = validateAmount(budgetInput, 100, 1000000);
    const bufferVal = validateAmount(bufferInput, 0, 100000);
    const totalDaysNum = parseInt(daysInput, 10);

    if (!budgetVal.isValid) {
      setConfigError(budgetVal.error || 'Invalid budget');
      return;
    }
    if (!bufferVal.isValid) {
      setConfigError(bufferVal.error || 'Invalid buffer');
      return;
    }
    if (isNaN(totalDaysNum) || totalDaysNum < 7 || totalDaysNum > 60) {
      setConfigError('Total days must be between 7 and 60 days.');
      return;
    }

    updateConfig({
      startingBudget: budgetVal.value,
      emergencyBufferGoal: bufferVal.value,
      totalDays: totalDaysNum,
    });

    setConfigError(null);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedJson = JSON.parse(text);
        const candidate = parsedJson?.data ?? parsedJson;

        const validation = validateAppStateSchema(candidate);
        if (validation.isValid && validation.parsed) {
          loadStateFromImport(validation.parsed);
          setImportMessage({ type: 'success', text: 'Plan data imported and verified successfully!' });
        } else {
          setImportMessage({ type: 'error', text: validation.error || 'Schema validation failed.' });
        }
      } catch {
        setImportMessage({ type: 'error', text: 'Failed to parse JSON file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-midnight-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
          Application Settings & Local Storage
        </h1>
        <p className="text-xs sm:text-sm text-paper-secondary mt-1">
          Zero-backend, privacy-first local financial vault with schema validation and offline persistence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BUDGET CONFIGURATION FORM */}
        <Card elevated className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-mint-lime" />
            <h2 className="text-base font-bold font-display text-paper-primary">
              Planning Horizon Settings
            </h2>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <Input
              label="Starting Budget (₹)"
              type="number"
              prefix="₹"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              helperText="Default ₹10,000 for standard 30-day challenge."
            />

            <Input
              label="Emergency Buffer Goal (₹)"
              type="number"
              prefix="₹"
              value={bufferInput}
              onChange={(e) => setBufferInput(e.target.value)}
              helperText="Amount protected from daily allowance."
            />

            <Input
              label="Total Cycle Days"
              type="number"
              min={7}
              max={60}
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              helperText="Standard 30 days."
            />

            {configError && (
              <p className="text-xs text-status-risk font-semibold">{configError}</p>
            )}

            {configSaved && (
              <p className="text-xs text-mint-lime font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Settings updated successfully!
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Save Plan Configuration
              </Button>
            </div>
          </form>
        </Card>

        {/* DATA PORTABILITY & BACKUP */}
        <Card elevated className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-mint-cyan" />
              <h2 className="text-base font-bold font-display text-paper-primary">
                Local Storage & Portability
              </h2>
            </div>

            <p className="text-xs text-paper-secondary leading-relaxed mb-4">
              TENFLOW requires no cloud accounts or tracking cookies. All your data lives securely in
              browser localStorage (`tenflow_state_v1`). You can export or import your plan at any time.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-midnight-panel border border-midnight-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-paper-primary block">
                    Export Financial Plan
                  </span>
                  <span className="text-[10px] text-paper-muted">
                    Save transactions, commitments, and goals as JSON.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => exportStateAsJSON(state)}
                >
                  Export JSON
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight-panel border border-midnight-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-paper-primary block">
                    Import Financial Plan
                  </span>
                  <span className="text-[10px] text-paper-muted">
                    Restore from validated backup file.
                  </span>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight-border hover:bg-midnight-hover text-paper-primary font-medium text-xs transition-colors border border-midnight-border">
                    <Upload className="w-3.5 h-3.5" /> Import JSON
                  </span>
                </label>
              </div>

              {importMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    importMessage.type === 'success'
                      ? 'bg-mint-lime/10 text-mint-lime border border-mint-lime/30'
                      : 'bg-status-risk/10 text-status-risk border border-status-risk/30'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  {importMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-6 border-t border-midnight-border mt-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-paper-primary block">Reset Sample Data</span>
              <span className="text-[10px] text-paper-muted">
                Restore the default ₹10,000 student demo state.
              </span>
            </div>
            <Button
              size="sm"
              variant="danger"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setResetModalOpen(true)}
            >
              Reset Data
            </Button>
          </div>
        </Card>
      </div>

      {/* CONFIRM RESET MODAL */}
      {resetModalOpen && (
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Reset to Demo State?"
          description="This will clear your current local records and reload the default realistic 30-day sample plan."
        >
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetToSampleData();
                setResetModalOpen(false);
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
