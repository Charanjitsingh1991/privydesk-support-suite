/**
 * Subdomain Setup Instructions Component
 * Displays manual setup instructions for Hostinger subdomain creation
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink, Copy, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SetupStep {
  step: number;
  action: string;
  details: string;
}

interface ManualSetup {
  title: string;
  steps: SetupStep[];
  subdomain: string;
  estimatedTime: string;
  note: string;
}

interface SubdomainSetupInstructionsProps {
  manualSetup: ManualSetup;
  onComplete?: () => void;
}

export function SubdomainSetupInstructions({
  manualSetup,
  onComplete,
}: SubdomainSetupInstructionsProps) {
  const { toast } = useToast();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const copySubdomain = () => {
    navigator.clipboard.writeText(manualSetup.subdomain);
    toast({
      title: 'Copied',
      description: 'Subdomain copied to clipboard',
    });
  };

  const allStepsCompleted = completedSteps.length === manualSetup.steps.length;

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{manualSetup.title}</h3>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {manualSetup.estimatedTime}
            </Badge>
          </div>
          <p className="text-white/60 text-sm">
            Follow these steps to complete subdomain setup in Hostinger
          </p>
        </div>

        {/* Subdomain Display */}
        <div className="p-4 bg-accent-lime/10 border border-accent-lime/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Your Subdomain</p>
              <p className="text-lg font-mono text-accent-lime">
                {manualSetup.subdomain}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copySubdomain}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {manualSetup.steps.map((step) => {
            const isCompleted = completedSteps.includes(step.step);

            return (
              <div
                key={step.step}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleStep(step.step)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.step}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{step.action}</h4>
                    <p className="text-sm text-white/60">{step.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> {manualSetup.note}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open('https://hostinger.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Open Hostinger
          </Button>

          {allStepsCompleted && onComplete && (
            <Button onClick={onComplete} className="gap-2 bg-accent-lime text-black hover:bg-accent-lime/90">
              <CheckCircle2 className="h-4 w-4" />
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Progress</span>
            <span className="text-white font-medium">
              {completedSteps.length} / {manualSetup.steps.length} steps completed
            </span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-lime transition-all duration-300"
              style={{
                width: `${(completedSteps.length / manualSetup.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
