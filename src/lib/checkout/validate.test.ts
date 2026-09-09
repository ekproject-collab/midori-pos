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
  nomorMeja: "",
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

test("nomor meja is required only for dine-in", () => {
  assert.equal(
    validateCheckout({ ...valid, tipe: "dine_in" }).nomorMeja,
    "Nomor meja wajib untuk dine-in.",
  );
  assert.equal(
    isCheckoutValid({ ...valid, tipe: "dine_in", nomorMeja: "4" }),
    true,
  );
  // takeaway without a table is fine
  assert.equal(
    isCheckoutValid({ ...valid, tipe: "takeaway", nomorMeja: "" }),
    true,
  );
});

test("defaults are takeaway + cash and only miss the name", () => {
  assert.deepEqual(Object.keys(validateCheckout(defaultCheckoutValues)), [
    "nama",
  ]);
});
