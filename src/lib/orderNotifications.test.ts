import assert from "node:assert/strict";
import test from "node:test";

import { shouldNotifyUserForNewOrder } from "./orderNotifications";

test("admins always receive new-order notifications", () => {
  assert.equal(shouldNotifyUserForNewOrder({ role: "Admin", notificationEnabled: true }), true);
});

test("staff with orders permission receive new-order notifications", () => {
  assert.equal(
    shouldNotifyUserForNewOrder({ role: "Staff", permissions: ["orders", "menu"], notificationEnabled: true }),
    true
  );
});

test("staff without permissions configured still receive notifications", () => {
  assert.equal(shouldNotifyUserForNewOrder({ role: "Staff", permissions: [], notificationEnabled: true }), true);
});

test("staff without orders permission do not receive new-order notifications", () => {
  assert.equal(
    shouldNotifyUserForNewOrder({ role: "Staff", permissions: ["menu", "banners"], notificationEnabled: true }),
    false
  );
});

test("disabled users do not receive notifications", () => {
  assert.equal(
    shouldNotifyUserForNewOrder({ role: "Staff", permissions: ["orders"], notificationEnabled: false }),
    false
  );
});
