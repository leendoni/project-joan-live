import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDNMz04OaCKWdIjW7JN__tQrphVmUM4I8s",
    authDomain: "project-joan-live.firebaseapp.com",
    projectId: "project-joan-live",
    storageBucket: "project-joan-live.appspot.com",
    messagingSenderId: "104422126291",
    appId: "1:104422126291:web:6f950fbb24b991fccd5a26"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
