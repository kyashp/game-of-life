import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Baby, GraduationCap, School, BookOpen, DollarSign } from 'lucide-react';

export default function CostEventModal({ event, onAcknowledge, onDecision }) {
  if (!event) return null;

  const getIcon = () => {
    switch (event.category) {
      case 'birth':
        return <Baby className="w-16 h-16 text-blue-500" />;
      case 'education':
        return <GraduationCap className="w-16 h-16 text-purple-500" />;
      case 'medical':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case 'milestone':
        return <School className="w-16 h-16 text-green-500" />;
      default:
        return <DollarSign className="w-16 h-16 text-yellow-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {getIcon()}
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <DialogDescription className="text-lg text-gray-700">
            {event.description}
          </DialogDescription>

          {/* Cost Breakdown */}
          {event.costs && event.costs.length > 0 && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-semibold mb-3 text-red-900">Cost Breakdown</h3>
              <div className="space-y-2">
                {event.costs.map((cost, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{cost.item}</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(cost.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-red-300 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(event.totalCost || 0)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Benefits */}
          {event.benefits && event.benefits.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold mb-3 text-green-900">Government Benefits</h3>
              <div className="space-y-2">
                {event.benefits.map((benefit, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{benefit.item}</span>
                    <span className="font-semibold text-green-600">
                      +{formatCurrency(benefit.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-green-300 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-semibold">Total Benefits:</span>
                  <span className="text-xl font-bold text-green-600">
                    +{formatCurrency(event.totalBenefits || 0)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Net Impact */}
          {(event.totalCost !== undefined || event.totalBenefits !== undefined) && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Impact on Savings:</span>
                <span className={`text-2xl font-bold ${
                  (event.totalBenefits || 0) - (event.totalCost || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency((event.totalBenefits || 0) - (event.totalCost || 0))}
                </span>
              </div>
            </Card>
          )}

          {/* Decision Options or Acknowledge Button */}
          <div className="pt-4">
            {event.requiresDecision && event.options ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Choose an option:</h3>
                {event.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => onDecision(option.value)}
                    variant="outline"
                    className="w-full justify-between h-auto py-4 px-6 hover:bg-blue-50"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-base">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      )}
                    </div>
                    {option.cost !== undefined && (
                      <span className="text-red-600 font-semibold ml-4">
                        {formatCurrency(option.cost)}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                onClick={onAcknowledge}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
              >
                Continue Simulation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}