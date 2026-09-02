/**
 * QuickBite Raw Material & Supplier Vendor Contract Manager
 * Tracks commercial vendor terms, minimum purchase quantities (MOQ),
 * delivery lead times, credit periods, and quality inspection ratings.
 */

export interface SupplierVendor {
  vendorId: string;
  companyName: string;
  category: 'FRESH_PRODUCE' | 'DAIRY_POULTRY' | 'SPICES_OILS' | 'PACKAGING_BOXES' | 'BEVERAGES';
  contactPerson: string;
  phone: string;
  city: string;
  leadTimeHours: number;
  minimumOrderValue: number;
  qualityRating: number;
  paymentTermsDays: number;
  isActive: boolean;
}

export const REGISTERED_SUPPLIERS: SupplierVendor[] = [
  {
    vendorId: 'sup-01',
    companyName: 'FarmFresh Organic Farms Pvt Ltd',
    category: 'FRESH_PRODUCE',
    contactPerson: 'Ramesh Patel',
    phone: '+91 98450 11223',
    city: 'Bengaluru Rural',
    leadTimeHours: 12,
    minimumOrderValue: 2500,
    qualityRating: 4.9,
    paymentTermsDays: 15,
    isActive: true,
  },
  {
    vendorId: 'sup-02',
    companyName: 'Royal Dairy & Artisan Cheese Co',
    category: 'DAIRY_POULTRY',
    contactPerson: 'Sunil Verghese',
    phone: '+91 98451 44556',
    city: 'Hosur',
    leadTimeHours: 8,
    minimumOrderValue: 4000,
    qualityRating: 4.8,
    paymentTermsDays: 7,
    isActive: true,
  },
  {
    vendorId: 'sup-03',
    companyName: 'EcoPack Tamper-Proof Packaging Solutions',
    category: 'PACKAGING_BOXES',
    contactPerson: 'Anita Rao',
    phone: '+91 98452 77889',
    city: 'Peenya Industrial Area, Bengaluru',
    leadTimeHours: 24,
    minimumOrderValue: 5000,
    qualityRating: 4.9,
    paymentTermsDays: 30,
    isActive: true,
  },
];
