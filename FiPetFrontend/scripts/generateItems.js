"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firestore_1 = require("firebase/firestore");
var app_1 = require("firebase/app");
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDh1F64AeCS_xzkgATynBu4K4xOEIi1mns",
    authDomain: "fipet-521d1.firebaseapp.com",
    projectId: "fipet-521d1",
    storageBucket: "fipet-521d1.firebasestorage.app",
    messagingSenderId: "365751870741",
    appId: "1:365751870741:web:a0afa3d48256677627751c",
    measurementId: "G-S8BFBHYL8B"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
var db = (0, firestore_1.getFirestore)(app);
var items = [
    {
        name: "Hat",
        cost: 100,
        image: "🧢",
        imageType: "emoji",
        requiredLevel: 0,
    }
];
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var itemCollection, existingItems, loopEnd, itemsCreated, itemsDeleted, _loop_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                itemCollection = (0, firestore_1.collection)(db, "items");
                return [4 /*yield*/, (0, firestore_1.getDocs)(itemCollection)];
            case 1:
                existingItems = (_a.sent()).size;
                loopEnd = Math.max(items.length, existingItems);
                itemsCreated = 0;
                itemsDeleted = 0;
                console.log("Regenerating Items...");
                _loop_1 = function (i) {
                    var itemDoc = (0, firestore_1.doc)(itemCollection, "item-".concat(i));
                    if (i < items.length) {
                        (0, firestore_1.setDoc)(itemDoc, __assign({}, items[i])).then(function () {
                            itemsCreated++;
                        }).catch(function (err) {
                            console.error(err, "Failed to create item-".concat(i, " with name ").concat(items[i].name));
                        }).finally(function () {
                            if (i === loopEnd - 1) {
                                console.log("Created ".concat(itemsCreated, " items!"));
                                console.log("Deleted ".concat(itemsDeleted, " items!"));
                                process.exit(0);
                            }
                        });
                    }
                    else {
                        (0, firestore_1.deleteDoc)(itemDoc).then(function () {
                            itemsDeleted++;
                        }).catch(function (err) {
                            console.error(err, "Failed to delete item-".concat(i));
                        }).finally(function () {
                            if (i === loopEnd - 1) {
                                console.log("Created ".concat(itemsCreated, " items!"));
                                console.log("Deleted ".concat(itemsDeleted, " items!"));
                                process.exit(0);
                            }
                        });
                    }
                };
                for (i = 0; i < loopEnd; i++) {
                    _loop_1(i);
                }
                return [2 /*return*/];
        }
    });
}); })();
