import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateCareerJobAI, type CareerJobAiTask } from '../lib/ai';
import { Button } from './ui/Button';

interface AiAssistPanelProps {
  task: CareerJobAiTask;
  /** Text sent to the edge function */
  buildInput: () => string;
  /** Called when user accepts AI result */
  onAccept: (result: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Compact AI assist: generate → preview → Use / Try again / Cancel
 * Never auto-overwrites user content.
 */
export function AiAssistPanel({
  task,
  buildInput,
  onAccept,
  label = 'Improve with AI',
  className = '',
  disabled,
}: AiAssistPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCall, setLastCall] = useState(0);

  const run = async () => {
    const now = Date.now();
    if (now - lastCall < 2500) {
      setError('Please wait a moment before trying again.');
      return;
    }
    setLastCall(now);
    setLoading(true);
    setError(null);
    setOpen(true);

    const input = buildInput();
    const res = await generateCareerJobAI({ task, input });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      setPreview(null);
      return;
    }
    setPreview(res.result);
  };

  const cancel = () => {
    setOpen(false);
    setPreview(null);
    setError(null);
  };

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || loading}
        loading={loading}
        onClick={run}
        className="!text-[#0066FF] !border-[#B3D1FF] hover:!bg-[#EEF4FF]"
      >
        <Sparkles className="w-3.5 h-3.5" aria-hidden />
        {loading ? 'Generating…' : label}
      </Button>

      {open && (
        <div className="mt-3 rounded-xl border border-[#E8ECF1] bg-[#F7F9FC] p-3 space-y-3">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {preview && (
            <>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">AI suggestion</p>
              <div className="text-sm text-slate-800 whitespace-pre-wrap bg-white border border-slate-100 rounded-lg p-3 max-h-56 overflow-y-auto">
                {preview}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onAccept(preview);
                    cancel();
                  }}
                >
                  Use this
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={loading} onClick={run}>
                  Try again
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={cancel}>
                  Cancel
                </Button>
              </div>
            </>
          )}
          {!preview && !error && loading && (
            <p className="text-sm text-slate-500">Generating…</p>
          )}
          {!preview && !error && !loading && (
            <Button type="button" size="sm" variant="ghost" onClick={cancel}>
              Close
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
