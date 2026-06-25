"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_v8_1 = __importDefault(require("node:v8"));
if (node_v8_1.default?.startupSnapshot) {
    try {
        node_v8_1.default.startupSnapshot.isBuildingSnapshot();
    }
    catch {
        Object.defineProperty(node_v8_1.default.startupSnapshot, 'isBuildingSnapshot', {
            value: () => false,
            writable: true,
            configurable: true,
        });
    }
}
//# sourceMappingURL=bun-preload.js.map