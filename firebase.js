//==================================================//
// FIREBASE.JS - PART 1/2
// FIREBASE INITIALIZATION
//==================================================//

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


//==================================================//
// FIREBASE CONFIG
//==================================================//

const firebaseConfig = {

    apiKey:
        "AIzaSyC-SoKaVpljTCYcmYj7Oov37M8MIRaPQgk",

    authDomain:
        "wventertainment-27bfe.firebaseapp.com",

    projectId:
        "wventertainment-27bfe",

    storageBucket:
        "wventertainment-27bfe.firebasestorage.app",

    messagingSenderId:
        "277601494013",

    appId:
        "1:277601494013:web:4785b215324f6652acaf94",

    measurementId:
        "G-J1ZYCYRWWV"

};


//==================================================//
// INITIALIZE FIREBASE
//==================================================//

const firebaseApp =
    initializeApp(
        firebaseConfig
    );


//==================================================//
// FIREBASE AUTHENTICATION
//==================================================//

const auth =
    getAuth(
        firebaseApp
    );

const provider =
    new GoogleAuthProvider();


//==================================================//
// FIRESTORE DATABASE
//==================================================//

const db =
    getFirestore(
        firebaseApp
    );


//==================================================//
// EXPORT
//==================================================//

export {

    firebaseApp,

    auth,

    db,

    provider,

    signInWithPopup,

    signOut,

    onAuthStateChanged,

    doc,

    setDoc,

    getDoc,

    serverTimestamp

};


//==================================================//
// FIREBASE.JS PART 1 COMPLETE
//==================================================// 
//==================================================//
// FIREBASE.JS - PART 2/2
// FIRESTORE USER FUNCTIONS
//==================================================//


//==================================================//
// GET USER DOCUMENT
//==================================================//

async function getUserData(uid){

    if(!uid){

        return null;

    }

    try{

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        const snapshot =
            await getDoc(
                userRef
            );

        if(snapshot.exists()){

            return snapshot.data();

        }

        return null;

    }

    catch(error){

        console.error(
            "Get user data error:",
            error
        );

        return null;

    }

}


//==================================================//
// CREATE USER DOCUMENT
//==================================================//

async function createUserData(
    user
){

    if(!user){

        return false;

    }

    try{

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        await setDoc(
            userRef,
            {

                uid:
                    user.uid,

                name:
                    user.displayName ||
                    "User",

                email:
                    user.email ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                premium:false,

                favorites:[],

                createdAt:
                    serverTimestamp()

            },
            {
                merge:true
            }
        );

        return true;

    }

    catch(error){

        console.error(
            "Create user error:",
            error
        );

        return false;

    }

}


//==================================================//
// UPDATE USER DATA
//==================================================//

async function updateUserData(
    uid,
    data
){

    if(!uid || !data){

        return false;

    }

    try{

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        await setDoc(
            userRef,
            {

                ...data,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge:true
            }
        );

        return true;

    }

    catch(error){

        console.error(
            "Update user data error:",
            error
        );

        return false;

    }

}


//==================================================//
// EXPORT FIRESTORE FUNCTIONS
//==================================================//

export {

    getUserData,

    createUserData,

    updateUserData

};


//==================================================//
// FIREBASE.JS COMPLETE
//==================================================//