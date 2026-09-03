import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

interface NutritionProps {
  dishName: string;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  dietaryFiberGrams: number;
  healthScore: number;
}

export const NutritionLabelCard: React.FC<NutritionProps> = ({
  dishName,
  caloriesKcal,
  proteinGrams,
  carbsGrams,
  fatsGrams,
  dietaryFiberGrams,
  healthScore,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 max-w-sm">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Nutrition Facts</h4>
        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">Zavora Certified</span>
      </div>

      <div className="space-y-1 text-xs">
        <p className="font-bold text-slate-900">{dishName}</p>
        <div className="flex justify-between items-baseline border-b-4 border-slate-900 pb-1">
          <span className="font-bold text-slate-700">Amount Per Serving</span>
          <span className="text-lg font-black text-slate-900">{caloriesKcal} Calories</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
        <div className="py-1.5 flex justify-between">
          <span><strong>Total Fat</strong> {fatsGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((fatsGrams / 65) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span><strong>Total Carbohydrates</strong> {carbsGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((carbsGrams / 300) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span className="pl-4 text-slate-500">Dietary Fiber {dietaryFiberGrams}g</span>
          <span className="font-bold text-slate-900">{Math.round((dietaryFiberGrams / 25) * 100)}% DV</span>
        </div>
        <div className="py-1.5 flex justify-between">
          <span><strong>Protein</strong> {proteinGrams}g</span>
          <span className="font-bold text-emerald-600">{Math.round((proteinGrams / 50) * 100)}% DV</span>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Health Score
        </div>
        <span className="font-black text-emerald-700 text-sm">{healthScore} / 100</span>
      </div>
    </div>
  );
};
