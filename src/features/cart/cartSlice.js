import { createSlice } from '@reduxjs/toolkit';

const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon')) || null;

// Helper to calculate totals
const calculateTotals = (items, deliveryFee = 0, coupon = null) => {
    let originalTotal = 0;
    const itemsPrice = items.reduce((acc, item) => {
        // Calculate original price total
        originalTotal += item.price * item.qty;

        // Use discountedPrice if available for the actual subtotal
        const price = item.discountedPrice || item.price;
        return acc + price * item.qty;
    }, 0);

    let discountAmount = 0;
    if (coupon) {
        if (coupon.discountType === 'percentage') {
            discountAmount = (itemsPrice * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        } else if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
        }
        // Discount cannot exceed items price
        discountAmount = Math.min(discountAmount, itemsPrice);
    }

    const totalPrice = Math.max(0, itemsPrice + deliveryFee - discountAmount);

    return {
        itemsPrice,
        originalTotal,
        discountAmount,
        totalPrice
    };
};

const initialTotals = calculateTotals(cartItems, 0, appliedCoupon);

const initialState = {
    cartItems: cartItems,
    itemsPrice: initialTotals.itemsPrice,
    originalTotal: initialTotals.originalTotal,
    deliveryFee: 0,
    appliedCoupon: appliedCoupon,
    discount: initialTotals.discountAmount,
    totalPrice: initialTotals.totalPrice,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }

            const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
            state.itemsPrice = totals.itemsPrice;
            state.originalTotal = totals.originalTotal;
            state.discount = totals.discountAmount;
            state.totalPrice = totals.totalPrice;

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);

            // If cart is empty, remove coupon too
            if (state.cartItems.length === 0) {
                state.appliedCoupon = null;
                state.deliveryFee = 0;
                localStorage.removeItem('appliedCoupon');
            }

            const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
            state.itemsPrice = totals.itemsPrice;
            state.originalTotal = totals.originalTotal;
            state.discount = totals.discountAmount;
            state.totalPrice = totals.totalPrice;

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        increaseQty: (state, action) => {
            const item = state.cartItems.find((x) => x._id === action.payload);
            if (item) {
                item.qty += 1;
                const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
                state.itemsPrice = totals.itemsPrice;
                state.originalTotal = totals.originalTotal;
                state.discount = totals.discountAmount;
                state.totalPrice = totals.totalPrice;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        decreaseQty: (state, action) => {
            const item = state.cartItems.find((x) => x._id === action.payload);
            if (item && item.qty > 1) {
                item.qty -= 1;
                const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
                state.itemsPrice = totals.itemsPrice;
                state.originalTotal = totals.originalTotal;
                state.discount = totals.discountAmount;
                state.totalPrice = totals.totalPrice;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.itemsPrice = 0;
            state.originalTotal = 0;
            state.deliveryFee = 0;
            state.appliedCoupon = null;
            state.discount = 0;
            state.totalPrice = 0;
            localStorage.removeItem('cartItems');
            localStorage.removeItem('appliedCoupon');
        },
        setDeliveryFee: (state, action) => {
            state.deliveryFee = action.payload;
            const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
            state.totalPrice = totals.totalPrice;
        },
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload;
            const totals = calculateTotals(state.cartItems, state.deliveryFee, state.appliedCoupon);
            state.itemsPrice = totals.itemsPrice;
            state.originalTotal = totals.originalTotal;
            state.discount = totals.discountAmount;
            state.totalPrice = totals.totalPrice;
            localStorage.setItem('appliedCoupon', JSON.stringify(action.payload));
        },
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            const totals = calculateTotals(state.cartItems, state.deliveryFee, null);
            state.itemsPrice = totals.itemsPrice;
            state.originalTotal = totals.originalTotal;
            state.discount = totals.discountAmount;
            state.totalPrice = totals.totalPrice;
            localStorage.removeItem('appliedCoupon');
        }
    },
});

export const {
    addToCart,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
    setDeliveryFee,
    applyCoupon,
    removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
