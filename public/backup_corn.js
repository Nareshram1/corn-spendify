"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const blob_1 = require("@vercel/blob");
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Initialize Twilio client
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
function sendSms(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const toPhoneNumber = process.env.TO_PHONE_NUMBER;
        const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        try {
            yield twilioClient.messages.create({
                body: message,
                from: fromPhoneNumber,
                to: toPhoneNumber,
            });
            console.log('SMS sent successfully.');
        }
        catch (error) {
            console.error('Error sending SMS:', error);
        }
    });
}
function backupTable(tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const d = new Date();
        const { data, error } = yield supabase.from(tableName).select('*');
        if (error) {
            console.error(`Error fetching data from ${tableName}:`, error);
            return false;
        }
        const filePath = `./backup/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}/${tableName}.json`;
        const { url } = yield (0, blob_1.put)(filePath, JSON.stringify(data, null, 2), { access: 'public' });
        console.log(url);
        console.log(`Backup for ${tableName} completed.`);
        return true;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let success = true;
        const tables = process.env.SUPABASE_TABLES.split(',');
        for (const table of tables) {
            console.log(`Backup for ${table} started...`);
            const result = yield backupTable(table);
            if (!result) {
                success = false;
            }
        }
        if (success) {
            yield sendSms('Spendify backup is complete.');
        }
        else {
            yield sendSms('Backup process failed for spendify.');
        }
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send('Server is Alive.');
    }
    catch (error) {
        console.error('Issues in server:', error);
        res.status(500).send('Issues in server.');
    }
}));
app.get('/backup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main();
        res.status(200).send('Backup process completed.');
    }
    catch (error) {
        console.error('Error during backup:', error);
        yield sendSms('Backup process encountered an error.');
        res.status(500).send('Backup failed.');
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
