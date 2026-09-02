/**
 * QuickBite Kitchen Inventory Forecasting & Stockout Intelligence
 * Models per-dish ingredient depletion rates, peak consumption forecasting,
 * and automated re-stock advisory triggers for restaurant chefs.
 */

export interface IngredientRequirement {
  ingredientId: string;
  name: string;
  unit: 'GRAMS' | 'KILOGRAMS' | 'LITERS' | 'MILLILITERS' | 'UNITS';
  currentStockLevel: number;
  minimumSafetyThreshold: number;
  estimatedDailyBurnRate: number;
  daysRemainingBeforeStockout: number;
  stockStatus: 'PLENTIFUL' | 'ADEQUATE' | 'LOW_STOCK' | 'CRITICAL_STOCKOUT';
  supplierLeadTimeDays: number;
  recommendedOrderQuantity: number;
}

export interface DishIngredientRecipe {
  foodItemId: string;
  foodItemName: string;
  ingredients: Array<{
    ingredientName: string;
    quantityPerPortion: number;
    unit: string;
  }>;
}

export class InventoryForecastingService {
  /**
   * Forecast stockout days and generate replenishment requirements
   */
  public static forecastInventory(
    ingredients: Array<{
      id: string;
      name: string;
      unit: 'GRAMS' | 'KILOGRAMS' | 'LITERS' | 'MILLILITERS' | 'UNITS';
      currentStock: number;
      safetyThreshold: number;
      dailyConsumption: number;
      leadTimeDays: number;
    }>
  ): IngredientRequirement[] {
    return ingredients.map((item) => {
      const burnRate = Math.max(0.1, item.dailyConsumption);
      const daysLeft = Number((item.currentStock / burnRate).toFixed(1));

      let status: 'PLENTIFUL' | 'ADEQUATE' | 'LOW_STOCK' | 'CRITICAL_STOCKOUT' = 'ADEQUATE';
      if (item.currentStock <= item.safetyThreshold * 0.5) {
        status = 'CRITICAL_STOCKOUT';
      } else if (item.currentStock <= item.safetyThreshold) {
        status = 'LOW_STOCK';
      } else if (daysLeft > 10) {
        status = 'PLENTIFUL';
      }

      // Reorder quantity: 7 days of consumption + safety threshold
      const reorderQty = Math.round(burnRate * 7 + item.safetyThreshold);

      return {
        ingredientId: item.id,
        name: item.name,
        unit: item.unit,
        currentStockLevel: item.currentStock,
        minimumSafetyThreshold: item.safetyThreshold,
        estimatedDailyBurnRate: burnRate,
        daysRemainingBeforeStockout: daysLeft,
        stockStatus: status,
        supplierLeadTimeDays: item.leadTimeDays,
        recommendedOrderQuantity: reorderQty,
      };
    });
  }
}
