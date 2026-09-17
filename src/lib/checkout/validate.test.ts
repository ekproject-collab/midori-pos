import assert from "node:assert/strict";
import { test } from "node:test";

import {
  defaultCheckoutValues,
  isCheckoutValid,
  validateCheckout,
  type CheckoutValues,
} from "./validate";

const valid: CheckoutValues = {
  nama: "Budi",
  tipe: "takeaway",
  metode: "qris",
};

test("a filled takeaway order is valid", () => {
  assert.deepEqual(validateCheckout(valid), {});
  assert.equal(isCheckoutValid(valid), true);
});

test("nama is required (whitespace does not count)", () => {
  assert.equal(
    validateCheckout({ ...valid, nama: "   " }).nama,
    "Nama wajib diisi.",
  );
});

test("dine-in does not require a table number", () => {
  assert.equal(isCheckoutValid({ ...valid, tipe: "dine_in" }), true);
});

test("defaults are takeaway + cash and only miss the name", () => {
  assert.deepEqual(Object.keys(validateCheckout(defaultCheckoutValues)), [
    "nama",
  ]);
});
