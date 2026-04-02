"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "../components/Logo";
import { getActivePlans } from "@/app/utils/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Plan {
  id: string;
  name: string;
  price: string | number;
  currency: string;
  billingCycle: string;
}

const CheckoutForm = ({ plan }: { plan: Plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "United States",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'manual'>('stripe');
  const { auth } = useAuth();

  useEffect(() => {
    if (auth?.email) {
      setFormData(prev => ({
        ...prev,
        email: auth.email
      }));
    }
  }, [auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'manual') {
      return handleManualPayment();
    }

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name || !formData.email) {
      setError("Name and Email are required for billing.");
      setLoading(false);
      return;
    }

    try {
      if (!auth?.userId) throw new Error("Please log in as an employer.");

      // 1. Create Subscription on Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/stripe/create-subscription`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(auth?.token && { "Authorization": `Bearer ${auth.token}` })
        },
        body: JSON.stringify({
          userId: auth.userId, 
          planId: plan.id,
          email: formData.email,
          name: formData.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to initialize subscription.");
      }
      const { clientSecret, subscriptionId } = await res.json();

      // 2. Confirm Card Payment (Skip if clientSecret is null, which happens for $0 plans)
      if (clientSecret) {
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement)!,
            billing_details: {
              name: formData.name,
              email: formData.email,
              address: {
                line1: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zip,
                country: "US", 
              },
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      }
      
      // If success or skipped confirmation, redirect to success
      router.push(`/subscriptions/success?sub_id=${subscriptionId || ''}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth?.userId) throw new Error("Please log in as an employer.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/subscriptions/verification/manual-initiate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": auth.userId,
          ...(auth?.token && { "Authorization": `Bearer ${auth.token}` })
        },
        body: JSON.stringify({
          planId: plan.id,
        }),
      });

      if (!res.ok) {
        if (res.status === 500) {
          throw new Error("Your session is invalid or has expired (User not found). Please LOG OUT and LOG IN again.");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to initiate manual subscription.");
      }
      
      router.push("/subscriptions/success?method=manual");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="checkout-content" onSubmit={handlePayment}>
      <div className="checkout-cols">
        {/* BILLING DETAILS */}
        <div className="billing-col">
          <div className="card-box">
            <h3 className="box-title">Billing Detail</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Name*</label>
                <input type="text" name="name" value={formData.name} required placeholder="Full Name" onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input type="email" name="email" value={formData.email} required placeholder="Email Address" onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="company" value={formData.company} placeholder="Company Name" onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Country*</label>
              <select name="country" value={formData.country} onChange={handleInputChange}>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
            <div className="form-group">
              <label>Street*</label>
              <input type="text" name="street" value={formData.street} required placeholder="Street Address" onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Apartment</label>
              <input type="text" name="apartment" value={formData.apartment} placeholder="Apartment, suite, unit etc." onChange={handleInputChange} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Town/City*</label>
                <input type="text" name="city" value={formData.city} required placeholder="City" onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Postcode/Zip*</label>
                <input type="text" name="zip" value={formData.zip} required placeholder="Zip Code" onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>State*</label>
                <input type="text" name="state" value={formData.state} required placeholder="State" onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone*</label>
                <input type="text" name="phone" value={formData.phone} required placeholder="Phone Number" onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="card-box payment-box">
             <div className="payment-options">
                <div 
                  className={`payment-option ${paymentMethod === 'stripe' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                   <div className="check-dot"></div>
                   <span>{Number(plan.price) === 0 ? "Free Activation" : "Stripe / Card"}</span>
                </div>
                {Number(plan.price) > 0 && (
                  <div 
                    className={`payment-option ${paymentMethod === 'manual' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('manual')}
                  >
                    <div className="check-dot"></div>
                    <span>Manual Bank Transfer</span>
                  </div>
                )}
             </div>

             {paymentMethod === 'stripe' ? (
                Number(plan.price) > 0 ? (
                  <div className="stripe-inputs">
                      <div className="form-group">
                        <label>Card Holder Name</label>
                        <input type="text" placeholder="Card Holder Name" />
                      </div>
                      <div className="form-group">
                        <label>Card Number</label>
                        <div className="stripe-input-wrapper">
                            <CardNumberElement options={{style: stripeElementStyle}} />
                        </div>
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                            <label>Expire Date</label>
                            <div className="stripe-input-wrapper">
                              <CardExpiryElement options={{style: stripeElementStyle}} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>CVC</label>
                            <div className="stripe-input-wrapper">
                              <CardCvcElement options={{style: stripeElementStyle}} />
                            </div>
                        </div>
                      </div>
                      
                      {error && <div className="error-msg">{error}</div>}

                      <div className="terms-check">
                        <input type="checkbox" id="terms" required />
                        <label htmlFor="terms">By Continuing, you are agree to <a href="#">terms & conditions</a></label>
                      </div>

                      <button type="submit" disabled={loading} className="pay-btn">
                        {loading ? "Processing..." : `Pay ${plan.price}.00 ${plan.currency}`}
                      </button>
                  </div>
                ) : (
                  <div className="free-activation">
                      <p className="mb-6 text-gray-500">This is a free plan. No payment information is required.</p>
                      
                      {error && <div className="error-msg">{error}</div>}

                      <div className="terms-check">
                        <input type="checkbox" id="terms" required />
                        <label htmlFor="terms">By Continuing, you are agree to <a href="#">terms & conditions</a></label>
                      </div>

                      <button type="submit" disabled={loading} className="pay-btn">
                        {loading ? "Activating..." : "Activate Now"}
                      </button>
                  </div>
                )
             ) : (
               <div className="manual-transfer-info">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                    <h4 className="font-bold text-[#001f5b] mb-3">Bank Transfer Details</h4>
                    <p className="text-sm text-[#4a5880] mb-2 font-semibold">Please transfer the amount to our official account:</p>
                    <ul className="text-sm space-y-1 text-[#001f5b] font-bold">
                      <li>Bank: HBL Bank</li>
                      <li>Account Name: America Needs Nurses LLC</li>
                      <li>Account Number: 1234-5678-9012</li>
                      <li>IBAN: PK12HBL0000012345678</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6 font-semibold">
                    After clicking "Proceed", you will be asked to upload the payment receipt for verification.
                  </p>

                  {error && <div className="error-msg">{error}</div>}

                  <div className="terms-check">
                      <input type="checkbox" id="terms" required />
                      <label htmlFor="terms">By Continuing, you are agree to <a href="#">terms & conditions</a></label>
                  </div>

                  <button type="submit" disabled={loading} className="pay-btn">
                    {loading ? "Initializing..." : "Proceed to Upload Receipt"}
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="summary-col">
          <div className="card-box summary-card">
            <h3 className="box-title">Order Summary</h3>
            <div className="summary-item">
              <span>{plan.name}</span>
              <span>${plan.price}</span>
            </div>
            <div className="summary-item">
              <span>GST</span>
              <span>$0.00</span>
            </div>
            <div className="summary-item">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="total-row">
              <span>Total</span>
              <span>${plan.price}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const stripeElementStyle = {
  base: {
    fontSize: '15px',
    color: '#0d1b3e',
    '::placeholder': {
      color: '#aab7c4',
    },
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  invalid: {
    color: '#bf0a2a',
  },
};

const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId) {
      getActivePlans()
        .then((plans: any[]) => {
          const found = plans.find(p => p.id === planId);
          setPlan(found);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [planId]);

  if (loading) return <div className="loader">Loading...</div>;
  if (!plan) return <div className="loader">Plan not found.</div>;

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-10">
        <div className="bg-red-50 border-2 border-dashed border-red-200 p-12 rounded-[2rem] text-center max-w-md">
           <h3 className="text-red-600 font-black text-2xl mb-4">Stripe Key Missing</h3>
           <p className="text-red-500 font-bold text-sm">
             The Payment Gateway (Stripe) is not configured. <br/>
             Please add <code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your frontend <code className="bg-red-100 px-2 py-1 rounded">.env</code> file.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <style jsx global>{`
        :root {
          --navy: #001f5b;
          --red: #bf0a2a;
          --text: #0d1b3e;
          --muted: #4a5880;
          --border: #e2e8f0;
          --bg: #f8fafc;
        }

        .checkout-page {
          background: var(--bg);
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          padding-bottom: 60px;
        }

        .checkout-header {
          background: linear-gradient(135deg, var(--navy) 0%, var(--red) 100%);
          padding: 60px 20px 100px;
          text-align: center;
          color: white;
        }
        .checkout-header h1 { font-size: 36px; margin-bottom: 8px; }
        .checkout-header p { opacity: 0.8; font-size: 16px; }

        .checkout-container {
          max-width: 1140px;
          margin: -60px auto 0;
          padding: 0 20px;
        }

        .login-tip {
          background: #e6fffa;
          color: #047481;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .checkout-cols {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .card-box {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }
        .box-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--navy);
        }

        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text);
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
        }
        .form-group input:focus { border-color: var(--red); outline: none; }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Payment UI */
        .payment-options {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 25px;
        }
        .payment-option {
          padding: 15px 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 600;
          color: var(--muted);
          position: relative;
        }
        .payment-option.active {
          color: var(--red);
        }
        .payment-option.active::after {
          content: "";
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 2px; background: var(--red);
        }
        .payment-option.disabled { opacity: 0.5; cursor: not-allowed; }

        .check-dot {
          width: 16px; height: 16px;
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .check-dot::after {
          content: "";
          width: 8px; height: 8px;
          background: var(--red);
          border-radius: 50%;
          display: none;
        }
        .payment-option.active .check-dot::after { display: block; }
        .check-dot.hollow { background: transparent; }

        .stripe-input-wrapper {
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          height: 46px;
        }

        .terms-check {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 25px 0;
          font-size: 14px;
          color: var(--muted);
        }
        .terms-check a { color: var(--red); text-decoration: none; }

        .pay-btn {
          width: 100%;
          padding: 16px;
          background: var(--red);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .pay-btn:hover { background: #a50924; transform: translateY(-1px); }
        .pay-btn:disabled { background: #e2e8f0; cursor: not-allowed; }

        .error-msg {
          color: #bf0a2a;
          background: #fff5f5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        /* Summary */
        .summary-card { position: sticky; top: 20px; }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 15px;
          color: var(--muted);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed var(--border);
          font-size: 18px;
          font-weight: 800;
          color: var(--navy);
        }

        .loader {
          display: flex; align-items: center; justify-content: center;
          min-height: 400px; font-size: 18px; font-weight: 600;
        }

        @media (max-width: 991px) {
          .checkout-cols { grid-template-columns: 1fr; }
          .summary-card { position: static; }
        }
      `}</style>

      <div className="checkout-header">
        <Logo theme="light" className="mb-8 justify-center" size="lg" />
        <h1>Checkout</h1>
        <p>Complete your purchase and start recruiting top talent today.</p>
      </div>

      <div className="checkout-container">
        <div className="login-tip">
          Hi Dear, Have you already an account? <a href="/login">Please Login</a>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm plan={plan} />
        </Elements>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
