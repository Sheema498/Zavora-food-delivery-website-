import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { restaurantService } from '../../services/restaurantService.js';

export interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FoodCategory[];
  initialItem?: FoodItem | null;
  onSaved: (item: FoodItem) => void;
}

export const FoodItemModal: React.FC<FoodItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialItem,
  onSaved,
}) => {
  const [categoryId, setCategoryId] = useState<string>(
    initialItem?.categoryId || categories[0]?.id || ''
  );
  const [name, setName] = useState<string>(initialItem?.name || '');
  const [description, setDescription] = useState<string>(initialItem?.description || '');
  const [price, setPrice] = useState<number>(initialItem?.price || 199);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(
    initialItem?.discountPrice || undefined
  );
  const [imageUrl, setImageUrl] = useState<string>(initialItem?.imageUrl || '');
  const [isVegetarian, setIsVegetarian] = useState<boolean>(initialItem?.isVegetarian || false);
  const [isVegan, setIsVegan] = useState<boolean>(initialItem?.isVegan || false);
  const [isSpicy, setIsSpicy] = useState<boolean>(initialItem?.isSpicy || false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(initialItem?.prepTimeMinutes || 15);
  const [calories, setCalories] = useState<number | undefined>(initialItem?.calories || undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !categoryId) {
      setError('Please fill in item name, description and select a category');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let saved: FoodItem;
      if (initialItem) {
        saved = await restaurantService.updateFoodItem(initialItem.id, {
          categoryId,
          name,
          description,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          imageUrl: imageUrl.trim() || null,
          isVegetarian,
          isVegan,
          isSpicy,
          prepTimeMinutes: Number(prepTimeMinutes),
          calories: calories ? Number(calories) : null,
        });
      } else {
        saved = await restaurantService.addFoodItem({
          categoryId,
          name,
          description,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          imageUrl: imageUrl.trim() || undefined,
          isVegetarian,
          isVegan,
          isSpicy,
          prepTimeMinutes: Number(prepTimeMinutes),
          calories: calories ? Number(calories) : undefined,
        });
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save food item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? 'Edit Food Item' : 'Add New Food Item'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Food Item Name"
          placeholder="e.g. Smashed Truffle Burger"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Describe ingredients, flavor profile, and cooking technique..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Base Price (₹)"
            type="number"
            min="10"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
          <Input
            label="Offer Price (₹, Optional)"
            type="number"
            min="0"
            placeholder="e.g. 249"
            value={discountPrice || ''}
            onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <Input
          label="Image URL (Optional)"
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prep Time (Minutes)"
            type="number"
            min="5"
            max="60"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
          />
          <Input
            label="Calories (kcal, Optional)"
            type="number"
            placeholder="e.g. 650"
            value={calories || ''}
            onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Vegetarian</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isVegan}
              onChange={(e) => setIsVegan(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Vegan</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isSpicy}
              onChange={(e) => setIsSpicy(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Spicy</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {initialItem ? 'Update Item' : 'Add Food Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
