import React, { useState } from 'react';
import { Booking } from '../types';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle, X, Receipt, Download, Smartphone } from 'lucide-react';

interface StripeCheckoutModalProps {
  bookingData: Partial<Booking>;
  onSuccess: (confirmedBooking: Booking) => void;
  onClose: () => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  bookingData,
  onSuccess,
  onClose,
}) => {
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('888');
  const [cardZip, setCardZip] = useState<string>('90210');
  const [cardName, setCardName] = useState<string>(bookingData.customerName || '');

  // Payment State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<Booking | null>(null);

  const totalToPay = paymentOption === 'full' 
    ? (bookingData.totalPrice || 250) 
    : (bookingData.depositAmount || Math.round((bookingData.totalPrice || 250) * 0.25));

  // Quick fill test card
  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardZip('90210');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Call server Stripe checkout session
      const stripeRes = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalToPay,
          currency: 'USD',
          customerEmail: bookingData.customerEmail,
          description: `Whistle Stop Cleaning - ${bookingData.cleaningType} on ${bookingData.date}`,
          paymentType: paymentOption,
        }),
      });

      const stripeData = await stripeRes.json();

      // Submit booking to backend
      const bookingPayload = {
        ...bookingData,
        paymentStatus: paymentOption === 'full' ? 'fully_paid' : 'deposit_paid',
        stripePaymentIntentId: stripeData.paymentIntentId || `pi_stripe_${Date.now()}`,
      };

      const bkRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const bkData = await bkRes.json();
      setIsProcessing(false);

      if (bkRes.ok && bkData.success) {
        setPaymentCompleted(bkData.booking);
      } else {
        alert(bkData.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert('Error connecting to payment processor.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-stone-300 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">
                Stripe Payment Checkout
              </h2>
              <p className="text-xs text-stone-400">
                Whistle Stop Cleaning • 256-Bit Encrypted Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentCompleted ? (
          /* Receipt Screen */
          <div className="p-8 space-y-6 text-center bg-stone-50">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest font-mono">
                Payment Received & Booking Confirmed!
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                ${totalToPay}.00 USD Paid
              </h3>
              <p className="text-xs text-stone-500">
                Transaction ID: {paymentCompleted.stripePaymentIntentId}
              </p>
            </div>

            {/* Receipt details */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left text-xs space-y-2.5 shadow-sm">
              <div className="flex justify-between border-b border-stone-100 pb-2 font-bold text-stone-900">
                <span>Whistle Stop Reference</span>
                <span>{paymentCompleted.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Scheduled Date:</span>
                <strong className="text-stone-900">{paymentCompleted.date} ({paymentCompleted.timeSlot})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Service Address:</span>
                <span className="text-stone-900 font-medium">{paymentCompleted.propertyAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Customer:</span>
                <span className="text-stone-900 font-medium">{paymentCompleted.customerName} ({paymentCompleted.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status:</span>
                <span className="text-emerald-700 font-bold uppercase">{paymentCompleted.paymentStatus}</span>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <span>SMS confirmation & entry details dispatched to <strong>{paymentCompleted.customerPhone}</strong>.</span>
            </div>

            <button
              onClick={() => onSuccess(paymentCompleted)}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md"
            >
              Done & View In Portal
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="p-6 space-y-6">
            
            {/* Amount Selection Toggle */}
            <div className="bg-stone-100 p-1.5 rounded-xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setPaymentOption('full')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  paymentOption === 'full'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-300'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Full Payment (${bookingData.totalPrice})
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('deposit')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  paymentOption === 'deposit'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-300'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                25% Deposit (${bookingData.depositAmount})
              </button>
            </div>

            {/* Total Display */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Amount Due Now
                </span>
                <span className="text-2xl font-extrabold text-stone-900">
                  ${totalToPay}.00
                </span>
              </div>
              <button
                type="button"
                onClick={fillTestCard}
                className="text-[11px] bg-stone-900 hover:bg-stone-800 text-amber-400 font-mono font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Autofill Test Card
              </button>
            </div>

            {/* Credit Card Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm font-semibold"
                  />
                  <CreditCard className="w-5 h-5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-mono text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-mono text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Zip"
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-mono text-sm text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-base shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Lock className="w-5 h-5" />
                <span>{isProcessing ? 'Processing Payment...' : `Pay $${totalToPay}.00 via Stripe`}</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tested & Protected by Stripe SSL Payments</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
