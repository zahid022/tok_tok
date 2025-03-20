import { Injectable } from "@nestjs/common";
import admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    public firebaseApp: admin.app.App;

    constructor() {
        const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKeyBase64) {
            throw new Error("FIREBASE_PRIVATE_KEY environment variable is missing.");
        }

        const privateKey = JSON.parse(Buffer.from(privateKeyBase64, 'base64').toString('utf-8'));

        this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(privateKey)
        });
    }
}
