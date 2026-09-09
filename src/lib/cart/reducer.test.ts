import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cartReducer,
  selectItemCount,
  selectLineSubtotal,
  selectQuantityOf,
  selectSubtotal,
} from "./reducer";
import { emptyCart, type CartItem, type CartState } from "./types";

const matcha: Omit<CartItem, "kuantitas"> = {
  id_produk: 1,
  nama_produk: "Midori Signature",
  harga: 18000,
  gambar_url: null,
};
const kopi: Omit<CartItem, "kuantitas"> = {
  id_produk: 2,
  nama_produk: "Midori Aren Latte",
  harga: 15000,
  gambar_url: null,
};

test("add: inserts a new line with quantity 1 by default", () => {
  const state = cartReducer(emptyCart, { type: "add", item: matcha });
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].kuantitas, 1);
});

test("add: same product increments the existing line, not a duplicate", () => {
  let state = cartReducer(emptyCart, { type: "add", item: matcha });
  state = cartReducer(state, { type: "add", item: matcha, kuantitas: 2 });
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].kuantitas, 3);
});

test("add: different products create separate lines", () => {
  let state = cartReducer(emptyCart, { type: "add", item: matcha });
  state = cartReducer(state, { type: "add", item: kopi });
  assert.equal(state.items.length, 2);
});

test("setQuantity: updates a line", () => {
  let state = cartReducer(emptyCart, { type: "add", item: matcha });
  state = cartReducer(state, {
    type: "setQuantity",
    id_produk: 1,
    kuantitas: 5,
  });
  assert.equal(state.items[0].kuantitas, 5);
});

test("setQuantity: to 0 removes the line", () => {
  let state = cartReducer(emptyCart, { type: "add", item: matcha });
  state = cartReducer(state, {
    type: "setQuantity",
    id_produk: 1,
    kuantitas: 0,
  });
  assert.equal(state.items.length, 0);
});

test("quantity is clamped to 1..99 and integer", () => {
  let state = cartReducer(emptyCart, {
    type: "add",
    item: matcha,
    kuantitas: 500,
  });
  assert.equal(state.items[0].kuantitas, 99);

  state = cartReducer(state, {
    type: "setQuantity",
    id_produk: 1,
    kuantitas: 2.9,
  });
  assert.equal(state.items[0].kuantitas, 2);
});

test("remove and clear", () => {
  let state = cartReducer(emptyCart, { type: "add", item: matcha });
  state = cartReducer(state, { type: "add", item: kopi });
  state = cartReducer(state, { type: "remove", id_produk: 1 });
  assert.deepEqual(
    state.items.map((i) => i.id_produk),
    [2],
  );
  state = cartReducer(state, { type: "clear" });
  assert.equal(state.items.length, 0);
});

test("hydrate: passing a full state replaces the cart", () => {
  const stored: CartState = {
    items: [{ ...matcha, kuantitas: 4 }],
  };
  const state = cartReducer(emptyCart, stored);
  assert.equal(state.items[0].kuantitas, 4);
});

test("selectors: subtotal, line subtotal, count, quantityOf", () => {
  let state = cartReducer(emptyCart, {
    type: "add",
    item: matcha,
    kuantitas: 2,
  }); // 36.000
  state = cartReducer(state, { type: "add", item: kopi, kuantitas: 3 }); // 45.000

  assert.equal(selectLineSubtotal(state.items[0]), 36000);
  assert.equal(selectSubtotal(state), 81000);
  assert.equal(selectItemCount(state), 5);
  assert.equal(selectQuantityOf(state, 2), 3);
  assert.equal(selectQuantityOf(state, 999), 0);
});
