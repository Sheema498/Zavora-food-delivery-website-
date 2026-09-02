import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { restaurantService } from '../services/restaurantService.js';
import { FoodCategory, FoodItem } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { FoodItemModal } from '../components/restaurant/FoodItemModal.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
} from 'lucide-react';

export const RestaurantMenu: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isFoodModalOpen, setIsFoodModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [isSavingCategory, setIsSavingCategory] = useState<boolean>(false);

  const fetchMenu = async () => {
    if (!user?.restaurantId) return;
    try {
      setIsLoading(true);
      const data = await restaurantService.getRestaurantMenu(user.restaurantId);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [user?.restaurantId]);

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      await restaurantService.updateFoodItem(item.id, {
        isAvailable: !item.isAvailable,
      });
      fetchMenu();
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you wish to delete this food item?')) return;
    try {
      await restaurantService.deleteFoodItem(itemId);
      fetchMenu();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsSavingCategory(true);
      await restaurantService.addCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Menu & Dishes Manager</h1>
          <p className="text-xs text-slate-500">
            Add items, configure prices, categorize dishes, and toggle live availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            variant="outline"
            size="sm"
            icon={<FolderPlus className="w-4 h-4" />}
          >
            Add Category
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsFoodModalOpen(true);
            }}
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Food Item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-56 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <UtensilsCrossed className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No categories created yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create a category (e.g. Starters, Main Course, Beverages) to start adding dishes.
          </p>
          <Button onClick={() => setIsCategoryModalOpen(true)} variant="primary" size="sm">
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{category.name}</h3>
                  <p className="text-xs text-slate-400">
                    {category.foodItems?.length || 0} dishes in this category
                  </p>
                </div>
              </div>

              {category.foodItems && category.foodItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.foodItems.map((item: FoodItem) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                              item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {formatCurrency(item.discountPrice || item.price)}
                          </span>
                          {item.discountPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">• ~{item.prepTimeMinutes} mins</span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                          title="Toggle In-Stock / Out of Stock"
                        >
                          {item.isAvailable ? (
                            <>
                              <ToggleRight className="w-4 h-4" /> In Stock
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" /> Sold Out
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsFoodModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3">No dishes in this category yet.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Food Item Modal */}
      <FoodItemModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        categories={categories}
        initialItem={editingItem}
        onSaved={() => fetchMenu()}
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add New Menu Category"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Artisanal Pastas, Beverages..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={() => setIsCategoryModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingCategory}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
