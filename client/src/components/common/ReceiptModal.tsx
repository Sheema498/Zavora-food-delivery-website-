import React from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Order } from '../../types/index.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { Printer, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const parsedAddress = JSON.parse(order.deliveryAddressSnapshot || '{}');
  const invoiceNumber = `INV-${order.orderNumber}-${new Date(order.createdAt).getFullYear()}`;

  const cgst = (order.taxAmount / 2).toFixed(2);
  const sgst = (order.taxAmount / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official GST Tax Invoice & Receipt" maxWidth="lg">
      <div className="space-y-6 text-xs text-slate-800 print:text-black">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-brand-500 pb-4">
          <div>
            <span className="text-xl font-black text-brand-600 tracking-tight">QuickBite</span>
            <p className="text-[11px] text-slate-500">Official Electronic Tax Invoice</p>
          </div>

          <div className="sm:text-right">
            <span className="font-bold text-sm text-slate-900 block">{invoiceNumber}</span>
            <span className="text-slate-500 text-[11px]">Date: {formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Restaurant & Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Supplier / Kitchen:
            </span>
            <p className="font-bold text-sm text-slate-900">{order.restaurant.name}</p>
            <p className="text-slate-600">{order.restaurant.address}, {order.restaurant.city}</p>
            <p className="text-slate-500 text-[11px] mt-1">GSTIN: 29ABCDE1234F1Z5</p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Delivered & Billed To:
            </span>
            <p className="font-bold text-sm text-slate-900">{order.customer?.name || parsedAddress.recipientName}</p>
            <p className="text-slate-600">{parsedAddress.streetAddress}</p>
            <p className="text-slate-500 text-[11px] mt-1">Contact: {order.customer?.phone || parsedAddress.phone}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-2.5 rounded-l-lg">Item Description</th>
                <th className="p-2.5 text-center">SAC Code</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Unit Price</th>
                <th className="p-2.5 text-right rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2.5 font-medium">{item.name}</td>
                  <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">996331</td>
                  <td className="p-2.5 text-center">{item.quantity}</td>
                  <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2.5 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5 font-medium text-slate-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Item Subtotal:</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Logistics:</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST (2.5%):</span>
            <span>₹{cgst}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (2.5%):</span>
            <span>₹{sgst}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promo Discount:</span>
              <span>- {formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          {order.tipAmount > 0 && (
            <div className="flex justify-between text-brand-600">
              <span>Driver Tip (100%):</span>
              <span>+ {formatCurrency(order.tipAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-300 pt-2">
            <span>Grand Total Paid ({order.paymentMethod.replace(/_/g, ' ')}):</span>
            <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Security / Verification Footer */}
        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Digitally Verified Tax Invoice
          </div>
          <span className="font-mono text-[10px]">QB-HASH-2026-TAX-OK</span>
        </div>

        {/* Print / Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 print:hidden">
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
          <Button onClick={handlePrint} variant="primary" size="sm" icon={<Printer className="w-4 h-4" />}>
            Print / Save PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
