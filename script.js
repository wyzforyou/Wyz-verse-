//==================================================//
// SCRIPT.JS - PART 2/12
// SPLASH SCREEN & LOADING
//==================================================//

let splashProgress = 0;

let splashInterval = null;


//==================================================//
// START SPLASH LOADING
//==================================================//

function startSplashLoading(){

    splashProgress = 0;

    if(splashInterval){

        clearInterval(splashInterval);

    }

    updateSplashProgress();

    splashInterval = setInterval(() => {

        splashProgress += 2;

        updateSplashProgress();

        if(splashProgress >= 100){

            clearInterval(splashInterval);

            splashProgress = 100;

            updateSplashProgress();

            setTimeout(() => {

                finishSplashLoading();

            }, 500);

        }

    }, 40);

}


//==================================================//
// UPDATE SPLASH PROGRESS
//==================================================//

function updateSplashProgress(){

    if(progressFill){

        progressFill.style.width =
            `${splashProgress}%`;

    }

    if(progressPercent){

        progressPercent.textContent =
            `${splashProgress}%`;

    }

}


//==================================================//
// FINISH SPLASH
//==================================================//

function finishSplashLoading(){

    appState.currentScreen = "login";

    showScreen("loginScreen");

}


//==================================================//
// RESTART SPLASH
//==================================================//

function restartSplash(){

    if(splashInterval){

        clearInterval(splashInterval);

    }

    splashProgress = 0;

    updateSplashProgress();

    appState.currentScreen = "splash";

    showScreen("splashScreen");

    startSplashLoading();

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.startSplashLoading =
    startSplashLoading;

window.restartSplash =
    restartSplash;

window.updateSplashProgress =
    updateSplashProgress;
    //==================================================//
// SCRIPT.JS - PART 3/12
// GOOGLE LOGIN
//==================================================//


//==================================================//
// GOOGLE LOGIN BUTTON
//==================================================//

if(googleLoginBtn){

    googleLoginBtn.addEventListener(
        "click",
        loginWithGoogle
    );

}


//==================================================//
// LOGIN WITH GOOGLE
//==================================================//

async function loginWithGoogle(){

    try{

        appState.isLoading = true;

        googleLoginBtn.disabled = true;

        googleLoginBtn.style.opacity = "0.6";

        showScreen("syncScreen");

        updateSyncStatus(
            "login",
            "loading",
            "Signing in..."
        );

        const result =
            await window.signInWithPopup(
                window.auth,
                window.provider
            );

        const user =
            result.user;

        appState.currentUser = user;

        appState.isGuest = false;

        updateUserUI(user);

        updateSyncStatus(
            "login",
            "success",
            "Login successful"
        );

        await prepareUserAccount(user);

    }

    catch(error){

        console.error(
            "Google login error:",
            error
        );

        appState.isLoading = false;

        if(googleLoginBtn){

            googleLoginBtn.disabled = false;

            googleLoginBtn.style.opacity = "1";

        }

        showScreen("loginScreen");

        alert(
            "Login gagal. Silakan coba lagi."
        );

    }

}


//==================================================//
// GUEST LOGIN
//==================================================//

if(guestLoginBtn){

    guestLoginBtn.addEventListener(
        "click",
        loginAsGuest
    );

}


//==================================================//
// LOGIN AS GUEST
//==================================================//

function loginAsGuest(){

    appState.currentUser = null;

    appState.isGuest = true;

    appState.isPremium = false;

    appState.userData = null;

    updateUserUI(null);

    showScreen("homeScreen");

    appState.currentScreen = "home";

}


//==================================================//
// GOOGLE LOGIN STATE
//==================================================//

function monitorAuthentication(){

    if(!window.auth){

        return;

    }

    window.onAuthStateChanged(
        window.auth,
        user => {

            if(user){

                appState.currentUser = user;

                appState.isGuest = false;

                updateUserUI(user);

            }

        }
    );

}


//==================================================//
// START AUTH MONITOR
//==================================================//

monitorAuthentication();


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.loginWithGoogle =
    loginWithGoogle;

window.loginAsGuest =
    loginAsGuest;

window.monitorAuthentication =
    monitorAuthentication;
    //==================================================//
// SCRIPT.JS - PART 4/12
// ACCOUNT & LOGOUT
//==================================================//


//==================================================//
// LOGOUT
//==================================================//

async function logoutUser(){

    try{

        appState.isLoading = true;

        if(window.auth){

            await window.signOut(
                window.auth
            );

        }

        appState.currentUser = null;

        appState.userData = null;

        appState.isPremium = false;

        appState.isGuest = false;

        appState.favorites = [];

        appState.currentScreen = "login";

        updateUserUI(null);

        showScreen("loginScreen");

    }

    catch(error){

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Gagal logout. Silakan coba lagi."
        );

    }

    finally{

        appState.isLoading = false;

    }

}


//==================================================//
// CHECK CURRENT USER
//==================================================//

function getCurrentUser(){

    return appState.currentUser;

}


//==================================================//
// CHECK LOGIN STATUS
//==================================================//

function isUserLoggedIn(){

    return (
        appState.currentUser !== null
    );

}


//==================================================//
// CHECK GUEST STATUS
//==================================================//

function isGuestUser(){

    return appState.isGuest === true;

}


//==================================================//
// UPDATE ACCOUNT STATE
//==================================================//

function setCurrentUser(user){

    appState.currentUser = user;

    appState.isGuest = !user;

    updateUserUI(user);

}


//==================================================//
// CLEAR ACCOUNT DATA
//==================================================//

function clearAccountData(){

    appState.currentUser = null;

    appState.userData = null;

    appState.isPremium = false;

    appState.isGuest = false;

    appState.favorites = [];

    appState.currentModel = null;

    appState.currentCategory = null;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.logoutUser =
    logoutUser;

window.getCurrentUser =
    getCurrentUser;

window.isUserLoggedIn =
    isUserLoggedIn;

window.isGuestUser =
    isGuestUser;

window.setCurrentUser =
    setCurrentUser;

window.clearAccountData =
    clearAccountData;
    //==================================================//
// SCRIPT.JS - PART 5/12
// FIRESTORE USER SYNCHRONIZATION
//==================================================//


//==================================================//
// PREPARE USER ACCOUNT
//==================================================//

async function prepareUserAccount(user){

    if(!user){

        return;

    }

    try{

        updateSyncStatus(
            "user",
            "loading",
            "Loading user data..."
        );

        const userRef =
            window.doc(
                window.db,
                "users",
                user.uid
            );

        const userSnapshot =
            await window.getDoc(userRef);


        //==================================================//
        // EXISTING USER
        //==================================================//

        if(userSnapshot.exists()){

            const data =
                userSnapshot.data();

            appState.userData = data;

            appState.isPremium =
                data.premium === true;

            appState.favorites =
                Array.isArray(data.favorites)
                    ? data.favorites
                    : [];

            updateSyncStatus(
                "user",
                "success",
                "User data loaded"
            );

        }


        //==================================================//
        // NEW USER
        //==================================================//

        else{

            const newUserData = {

                uid: user.uid,

                name:
                    user.displayName ||
                    "User",

                email:
                    user.email ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                premium: false,

                favorites: [],

                createdAt:
                    window.serverTimestamp()

            };

            await window.setDoc(
                userRef,
                newUserData
            );

            appState.userData =
                newUserData;

            appState.isPremium = false;

            appState.favorites = [];

            updateSyncStatus(
                "user",
                "success",
                "Account created"
            );

        }


        //==================================================//
        // UPDATE UI
        //==================================================//

        updateUserUI(user);


        //==================================================//
        // PREMIUM CHECK
        //==================================================//

        updateSyncStatus(
            "premium",
            "loading",
            "Checking Premium..."
        );

        await checkPremiumStatus();


        //==================================================//
        // FINISH SYNC
        //==================================================//

        updateSyncStatus(
            "finish",
            "loading",
            "Finalizing..."
        );

        await delay(500);

        updateSyncStatus(
            "finish",
            "success",
            "Ready!"
        );

        await delay(400);

        appState.isLoading = false;

        appState.currentScreen = "home";

        showScreen("homeScreen");

    }

    catch(error){

        console.error(
            "Account synchronization error:",
            error
        );

        appState.isLoading = false;

        alert(
            "Gagal menyiapkan akun. Silakan coba lagi."
        );

        showScreen("loginScreen");

    }

}


//==================================================//
// DELAY HELPER
//==================================================//

function delay(milliseconds){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


//==================================================//
// UPDATE SYNC STATUS
//==================================================//

function updateSyncStatus(
    type,
    status,
    text
){

    const icon =
        document.getElementById(
            `sync${capitalize(type)}Icon`
        );

    const textElement =
        document.getElementById(
            `sync${capitalize(type)}Text`
        );


    if(icon){

        icon.classList.remove(
            "waiting",
            "loading",
            "success"
        );

        icon.classList.add(
            status
        );

    }


    if(textElement){

        textElement.textContent =
            text;

    }

}


//==================================================//
// CAPITALIZE HELPER
//==================================================//

function capitalize(value){

    if(!value){

        return "";

    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.prepareUserAccount =
    prepareUserAccount;

window.updateSyncStatus =
    updateSyncStatus;

window.delay =
    delay;
    //==================================================//
// SCRIPT.JS - PART 6/12
// PREMIUM STATUS & FIRESTORE
//==================================================//


//==================================================//
// CHECK PREMIUM STATUS
//==================================================//

async function checkPremiumStatus(){

    if(!appState.currentUser){

        appState.isPremium = false;

        updateSyncStatus(
            "premium",
            "success",
            "Guest account"
        );

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        const userSnapshot =
            await window.getDoc(userRef);


        if(userSnapshot.exists()){

            const data =
                userSnapshot.data();

            appState.userData = data;

            appState.isPremium =
                data.premium === true;

            appState.favorites =
                Array.isArray(data.favorites)
                    ? data.favorites
                    : [];

        }

        else{

            appState.isPremium = false;

        }


        updateSyncStatus(
            "premium",
            "success",
            appState.isPremium
                ? "Premium active"
                : "Free account"
        );

        return appState.isPremium;

    }

    catch(error){

        console.error(
            "Premium check error:",
            error
        );

        appState.isPremium = false;

        updateSyncStatus(
            "premium",
            "success",
            "Free account"
        );

        return false;

    }

}


//==================================================//
// GET PREMIUM STATUS
//==================================================//

function getPremiumStatus(){

    return appState.isPremium === true;

}


//==================================================//
// UPDATE PREMIUM STATUS
//==================================================//

async function updatePremiumStatus(
    premium
){

    if(!appState.currentUser){

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        await window.setDoc(
            userRef,
            {
                premium: premium === true,
                updatedAt:
                    window.serverTimestamp()
            },
            {
                merge:true
            }
        );

        appState.isPremium =
            premium === true;

        if(!appState.userData){

            appState.userData = {};

        }

        appState.userData.premium =
            appState.isPremium;

        return true;

    }

    catch(error){

        console.error(
            "Premium update error:",
            error
        );

        return false;

    }

}


//==================================================//
// SAVE FAVORITES
//==================================================//

async function saveFavorites(){

    if(!appState.currentUser){

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        await window.setDoc(
            userRef,
            {
                favorites:
                    appState.favorites,

                updatedAt:
                    window.serverTimestamp()

            },
            {
                merge:true
            }
        );

        return true;

    }

    catch(error){

        console.error(
            "Favorite save error:",
            error
        );

        return false;

    }

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.checkPremiumStatus =
    checkPremiumStatus;

window.getPremiumStatus =
    getPremiumStatus;

window.updatePremiumStatus =
    updatePremiumStatus;

window.saveFavorites =
    saveFavorites;
    //==================================================//
// SCRIPT.JS - PART 7/12
// SEARCH & CATEGORY
//==================================================//


//==================================================//
// SEARCH INPUT
//==================================================//

if(searchInput){

    searchInput.addEventListener(
        "input",
        handleSearch
    );

}


//==================================================//
// HANDLE SEARCH
//==================================================//

function handleSearch(event){

    const keyword =
        event.target.value
            .trim()
            .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".category-card"
        );

    cards.forEach(card => {

        const title =
            card.querySelector("h3");

        const description =
            card.querySelector("p");

        const titleText =
            title
                ? title.textContent.toLowerCase()
                : "";

        const descriptionText =
            description
                ? description.textContent.toLowerCase()
                : "";

        const category =
            card.dataset.category
                ? card.dataset.category.toLowerCase()
                : "";

        const matched =
            keyword === "" ||
            titleText.includes(keyword) ||
            descriptionText.includes(keyword) ||
            category.includes(keyword);

        card.style.display =
            matched
                ? ""
                : "none";

    });

}


//==================================================//
// CATEGORY BUTTONS
//==================================================//

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );


categoryCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const category =
                card.dataset.category;

            openCategory(category);

        }
    );

});


//==================================================//
// OPEN CATEGORY
//==================================================//

function openCategory(category){

    if(!category){

        return;

    }

    appState.currentCategory =
        category;

    console.log(
        "Category selected:",
        category
    );

    // Premium categories

    if(
        (
            category === "floating-island" ||
            category === "system"
        ) &&
        !appState.isPremium
    ){

        openPremiumPopup();

        return;

    }

    // Store selected category

    sessionStorage.setItem(
        "selectedCategory",
        category
    );

}


//==================================================//
// CLEAR SEARCH
//==================================================//

function clearSearch(){

    if(searchInput){

        searchInput.value = "";

        handleSearch({
            target: searchInput
        });

    }

}


//==================================================//
// GET SELECTED CATEGORY
//==================================================//

function getSelectedCategory(){

    return appState.currentCategory;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.handleSearch =
    handleSearch;

window.openCategory =
    openCategory;

window.clearSearch =
    clearSearch;

window.getSelectedCategory =
    getSelectedCategory;
    //==================================================//
// SCRIPT.JS - PART 8/12
// POPUP MANAGEMENT
//==================================================//


//==================================================//
// PREMIUM POPUP
//==================================================//

function openPremiumPopup(){

    if(!premiumPopup){

        return;

    }

    premiumPopup.classList.add("active");

}


//==================================================//
// CLOSE PREMIUM POPUP
//==================================================//

function closePremiumPopup(){

    if(!premiumPopup){

        return;

    }

    premiumPopup.classList.remove("active");

}


//==================================================//
// MODEL POPUP
//==================================================//

function openModelPopup(model){

    if(!modelPopup){

        return;

    }

    appState.currentModel =
        model || null;


    const preview =
        document.getElementById(
            "modelPreview"
        );

    const title =
        document.getElementById(
            "modelTitle"
        );

    const description =
        document.getElementById(
            "modelDescription"
        );


    if(preview){

        preview.src =
            model?.image ||
            "assets/default-model.jpg";

    }


    if(title){

        title.textContent =
            model?.name ||
            "Model";

    }


    if(description){

        description.textContent =
            model?.description ||
            "Model asset dari WV Entertainment.";

    }


    modelPopup.classList.add(
        "active"
    );

}


//==================================================//
// CLOSE MODEL POPUP
//==================================================//

function closeModelPopup(){

    if(!modelPopup){

        return;

    }

    modelPopup.classList.remove(
        "active"
    );

    appState.currentModel =
        null;

}


//==================================================//
// LOADING POPUP
//==================================================//

function showLoadingPopup(
    message = "Processing..."
){

    if(!loadingPopup){

        return;

    }

    const messageElement =
        document.getElementById(
            "loadingMessage"
        );

    if(messageElement){

        messageElement.textContent =
            message;

    }

    loadingPopup.classList.add(
        "active"
    );

}


//==================================================//
// HIDE LOADING POPUP
//==================================================//

function hideLoadingPopup(){

    if(!loadingPopup){

        return;

    }

    loadingPopup.classList.remove(
        "active"
    );

}


//==================================================//
// PREMIUM BUTTON
//==================================================//

if(
    document.getElementById(
        "premiumButton"
    )
){

    document.getElementById(
        "premiumButton"
    ).addEventListener(
        "click",
        openPremiumPopup
    );

}


//==================================================//
// CLOSE PREMIUM
//==================================================//

if(
    document.getElementById(
        "closePremiumPopup"
    )
){

    document.getElementById(
        "closePremiumPopup"
    ).addEventListener(
        "click",
        closePremiumPopup
    );

}


//==================================================//
// CLOSE MODEL
//==================================================//

if(
    document.getElementById(
        "closeModelPopup"
    )
){

    document.getElementById(
        "closeModelPopup"
    ).addEventListener(
        "click",
        closeModelPopup
    );

}


//==================================================//
// CLOSE POPUP WHEN CLICKING OUTSIDE
//==================================================//

document.querySelectorAll(
    ".popup-overlay"
).forEach(popup => {

    popup.addEventListener(
        "click",
        event => {

            if(
                event.target === popup
            ){

                popup.classList.remove(
                    "active"
                );

            }

        }
    );

});


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.openPremiumPopup =
    openPremiumPopup;

window.closePremiumPopup =
    closePremiumPopup;

window.openModelPopup =
    openModelPopup;

window.closeModelPopup =
    closeModelPopup;

window.showLoadingPopup =
    showLoadingPopup;

window.hideLoadingPopup =
    hideLoadingPopup;
    //==================================================//
// SCRIPT.JS - PART 9/12
// PREMIUM ACCESS
//==================================================//


//==================================================//
// BUY PREMIUM BUTTON
//==================================================//

const buyPremiumButton =
    document.getElementById(
        "buyPremiumButton"
    );


if(buyPremiumButton){

    buyPremiumButton.addEventListener(
        "click",
        handlePremiumPurchase
    );

}


//==================================================//
// HANDLE PREMIUM PURCHASE
//==================================================//

async function handlePremiumPurchase(){

    // Guest cannot activate Premium

    if(appState.isGuest){

        alert(
            "Silakan login terlebih dahulu untuk menggunakan Premium."
        );

        closePremiumPopup();

        showScreen("loginScreen");

        return;

    }


    if(!appState.currentUser){

        alert(
            "Silakan login terlebih dahulu."
        );

        closePremiumPopup();

        showScreen("loginScreen");

        return;

    }


    // Already Premium

    if(appState.isPremium){

        alert(
            "Akun kamu sudah memiliki Premium."
        );

        closePremiumPopup();

        return;

    }


    /*
     * Untuk sementara tombol ini belum
     * mengaktifkan Premium secara otomatis.
     *
     * Status Premium tetap disimpan
     * melalui Firestore.
     */

    showLoadingPopup(
        "Preparing Premium..."
    );

    await delay(800);

    hideLoadingPopup();

}


//==================================================//
// UNLOCK PREMIUM
//==================================================//

async function unlockPremium(){

    if(!appState.currentUser){

        return false;

    }


    showLoadingPopup(
        "Activating Premium..."
    );


    const success =
        await updatePremiumStatus(true);


    await delay(500);

    hideLoadingPopup();


    if(success){

        closePremiumPopup();

        alert(
            "Premium berhasil diaktifkan."
        );

        refreshPremiumUI();

        return true;

    }


    alert(
        "Gagal mengaktifkan Premium."
    );

    return false;

}


//==================================================//
// REFRESH PREMIUM UI
//==================================================//

function refreshPremiumUI(){

    const premiumBanner =
        document.querySelector(
            ".premium-banner"
        );

    const premiumButton =
        document.getElementById(
            "premiumButton"
        );


    if(appState.isPremium){

        if(premiumButton){

            premiumButton.textContent =
                "Premium";

        }


        if(premiumBanner){

            premiumBanner.style.opacity =
                "0.85";

        }


        document
            .querySelectorAll(
                ".category-card"
            )
            .forEach(card => {

                card.classList.add(
                    "premium-unlocked"
                );

            });

    }

}


//==================================================//
// CHECK PREMIUM BEFORE ACCESS
//==================================================//

function requirePremium(){

    if(appState.isPremium){

        return true;

    }


    openPremiumPopup();

    return false;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.handlePremiumPurchase =
    handlePremiumPurchase;

window.unlockPremium =
    unlockPremium;

window.refreshPremiumUI =
    refreshPremiumUI;

window.requirePremium =
    requirePremium;
    //==================================================//
// SCRIPT.JS - PART 10/12
// FAVORITES
//==================================================//


//==================================================//
// CHECK FAVORITE
//==================================================//

function isFavorite(modelId){

    if(!modelId){

        return false;

    }

    return appState.favorites.includes(
        modelId
    );

}


//==================================================//
// ADD FAVORITE
//==================================================//

async function addFavorite(modelId){

    if(!modelId){

        return false;

    }

    if(appState.isGuest){

        alert(
            "Silakan login untuk menyimpan favorit."
        );

        return false;

    }

    if(!appState.currentUser){

        return false;

    }

    if(isFavorite(modelId)){

        return true;

    }

    appState.favorites.push(
        modelId
    );

    const saved =
        await saveFavorites();

    if(!saved){

        appState.favorites =
            appState.favorites.filter(
                id => id !== modelId
            );

        return false;

    }

    return true;

}


//==================================================//
// REMOVE FAVORITE
//==================================================//

async function removeFavorite(modelId){

    if(!modelId){

        return false;

    }

    const previousFavorites =
        [...appState.favorites];

    appState.favorites =
        appState.favorites.filter(
            id => id !== modelId
        );

    const saved =
        await saveFavorites();

    if(!saved){

        appState.favorites =
            previousFavorites;

        return false;

    }

    return true;

}


//==================================================//
// TOGGLE FAVORITE
//==================================================//

async function toggleFavorite(modelId){

    if(isFavorite(modelId)){

        return await removeFavorite(
            modelId
        );

    }

    return await addFavorite(
        modelId
    );

}


//==================================================//
// GET FAVORITES
//==================================================//

function getFavorites(){

    return [
        ...appState.favorites
    ];

}


//==================================================//
// UPDATE FAVORITE BUTTON
//==================================================//

function updateFavoriteButton(
    button,
    modelId
){

    if(!button || !modelId){

        return;

    }

    const favorite =
        isFavorite(modelId);

    button.textContent =
        favorite
            ? "❤️"
            : "♡";

    button.classList.toggle(
        "active",
        favorite
    );

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.isFavorite =
    isFavorite;

window.addFavorite =
    addFavorite;

window.removeFavorite =
    removeFavorite;

window.toggleFavorite =
    toggleFavorite;

window.getFavorites =
    getFavorites;

window.updateFavoriteButton =
    updateFavoriteButton;
    //==================================================//
// SCRIPT.JS - PART 11/12
// PROFILE & NAVIGATION
//==================================================//


//==================================================//
// NAVIGATION ELEMENTS
//==================================================//

const navHome =
    document.getElementById("navHome");

const navExplore =
    document.getElementById("navExplore");

const navFavorite =
    document.getElementById("navFavorite");

const navProfile =
    document.getElementById("navProfile");


//==================================================//
// SET ACTIVE NAVIGATION
//==================================================//

function setActiveNavigation(
    activeButton
){

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });

    if(activeButton){

        activeButton.classList.add(
            "active"
        );

    }

}


//==================================================//
// HOME NAVIGATION
//==================================================//

if(navHome){

    navHome.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navHome
            );

            appState.currentScreen =
                "home";

            showScreen(
                "homeScreen"
            );

        }
    );

}


//==================================================//
// EXPLORE NAVIGATION
//==================================================//

if(navExplore){

    navExplore.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navExplore
            );

            appState.currentScreen =
                "explore";

            if(searchInput){

                searchInput.focus();

            }

        }
    );

}


//==================================================//
// FAVORITE NAVIGATION
//==================================================//

if(navFavorite){

    navFavorite.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navFavorite
            );

            appState.currentScreen =
                "favorite";

            displayFavoriteState();

        }
    );

}


//==================================================//
// PROFILE NAVIGATION
//==================================================//

if(navProfile){

    navProfile.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navProfile
            );

            appState.currentScreen =
                "profile";

            displayProfileState();

        }
    );

}


//==================================================//
// DISPLAY PROFILE STATE
//==================================================//

function displayProfileState(){

    const user =
        appState.currentUser;

    if(user){

        updateUserUI(user);

    }

    else{

        updateUserUI(null);

    }

}


//==================================================//
// DISPLAY FAVORITE STATE
//==================================================//

function displayFavoriteState(){

    const favorites =
        getFavorites();

    console.log(
        "Favorite models:",
        favorites
    );

}


//==================================================//
// USER ACCOUNT INFO
//==================================================//

function getUserProfile(){

    if(!appState.currentUser){

        return {

            name:"Guest",

            email:"",

            photoURL:
                DEFAULT_PROFILE_IMAGE,

            premium:false

        };

    }

    return {

        name:
            appState.currentUser.displayName ||
            "User",

        email:
            appState.currentUser.email ||
            "",

        photoURL:
            appState.currentUser.photoURL ||
            DEFAULT_PROFILE_IMAGE,

        premium:
            appState.isPremium

    };

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.setActiveNavigation =
    setActiveNavigation;

window.displayProfileState =
    displayProfileState;

window.displayFavoriteState =
    displayFavoriteState;

window.getUserProfile =
    getUserProfile;
    //==================================================//
// SCRIPT.JS - PART 12/12
// UTILITIES & FINAL INITIALIZATION
//==================================================//


//==================================================//
// UPDATE SYNC PROGRESS
//==================================================//

function updateSyncProgress(percent){

    const fill =
        document.getElementById(
            "syncProgressFill"
        );

    const text =
        document.getElementById(
            "syncProgressText"
        );

    const value =
        Math.max(
            0,
            Math.min(100, percent)
        );

    if(fill){

        fill.style.width =
            `${value}%`;

    }

    if(text){

        text.textContent =
            `${value}%`;

    }

}


//==================================================//
// SHOW HOME
//==================================================//

function showHome(){

    appState.currentScreen =
        "home";

    showScreen(
        "homeScreen"
    );

    if(navHome){

        setActiveNavigation(
            navHome
        );

    }

}


//==================================================//
// ESCAPE HTML
//==================================================//

function escapeHTML(value){

    if(value === null ||
       value === undefined){

        return "";

    }

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;

}


//==================================================//
// SAFE LOCAL STORAGE
//==================================================//

function saveLocalData(
    key,
    value
){

    try{

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    }

    catch(error){

        console.error(
            "Local storage error:",
            error
        );

        return false;

    }

}


function getLocalData(key){

    try{

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : null;

    }

    catch(error){

        console.error(
            "Local data error:",
            error
        );

        return null;

    }

}


//==================================================//
// CLOSE ALL POPUPS
//==================================================//

function closeAllPopups(){

    document
        .querySelectorAll(
            ".popup-overlay"
        )
        .forEach(popup => {

            popup.classList.remove(
                "active"
            );

        });

}


//==================================================//
// ESC KEY
//==================================================//

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            closeAllPopups();

        }

    }
);


//==================================================//
// INITIAL FIREBASE AUTH STATE
//==================================================//

if(window.auth){

    window.onAuthStateChanged(
        window.auth,
        user => {

            if(user){

                appState.currentUser =
                    user;

                appState.isGuest =
                    false;

                updateUserUI(user);

            }

        }
    );

}


//==================================================//
// FINAL EXPORTS
//==================================================//

window.updateSyncProgress =
    updateSyncProgress;

window.showHome =
    showHome;

window.escapeHTML =
    escapeHTML;

window.saveLocalData =
    saveLocalData;

window.getLocalData =
    getLocalData;

window.closeAllPopups =
    closeAllPopups;


//==================================================//
// SCRIPT.JS COMPLETE
//==================================================//
//==================================================//
// SCRIPT.JS - PART 1/12
// INITIALIZATION & GLOBAL STATE
//==================================================//

// Global application state

const appState = {

    currentScreen: "splash",

    currentUser: null,

    isGuest: false,

    isPremium: false,

    userData: null,

    currentModel: null,

    currentCategory: null,

    favorites: [],

    isLoading: false

};


//==================================================//
// DOM ELEMENTS
//==================================================//

const splashScreen =
    document.getElementById("splashScreen");

const loginScreen =
    document.getElementById("loginScreen");

const syncScreen =
    document.getElementById("syncScreen");

const homeScreen =
    document.getElementById("homeScreen");

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

const guestLoginBtn =
    document.getElementById("guestLoginBtn");

const userName =
    document.getElementById("userName");

const userPhoto =
    document.getElementById("userPhoto");

const searchInput =
    document.getElementById("searchInput");

const premiumPopup =
    document.getElementById("premiumPopup");

const modelPopup =
    document.getElementById("modelPopup");

const loadingPopup =
    document.getElementById("loadingPopup");


//==================================================//
// DEFAULT USER IMAGE
//==================================================//

const DEFAULT_PROFILE_IMAGE =
    "assets/default-profile.png";


//==================================================//
// APPLICATION READY
//==================================================//

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);


//==================================================//
// INITIALIZE APPLICATION
//==================================================//

function initializeApplication(){

    appState.currentScreen = "splash";

    showScreen("splashScreen");

    startSplashLoading();

}


//==================================================//
// SCREEN HELPER
//==================================================//

function showScreen(screenId){

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.remove("active");

    });

    const target =
        document.getElementById(screenId);

    if(target){

        target.classList.add("active");

    }

}


//==================================================//
// UPDATE USER UI
//==================================================//

function updateUserUI(user){

    if(!user){

        if(userName){

            userName.textContent =
                "Guest";

        }

        if(userPhoto){

            userPhoto.src =
                DEFAULT_PROFILE_IMAGE;

        }

        return;

    }

    if(userName){

        userName.textContent =
            user.displayName ||
            "User";

    }

    if(userPhoto){

        userPhoto.src =
            user.photoURL ||
            DEFAULT_PROFILE_IMAGE;

    }

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.appState = appState;

window.showScreen = showScreen;

window.updateUserUI = updateUserUI;
//==================================================//
// SCRIPT.JS - PART 2/12
// SPLASH SCREEN & LOADING
//==================================================//

let splashProgress = 0;

let splashInterval = null;


//==================================================//
// START SPLASH LOADING
//==================================================//

function startSplashLoading(){

    splashProgress = 0;

    if(splashInterval){

        clearInterval(splashInterval);

    }

    updateSplashProgress();

    splashInterval = setInterval(() => {

        splashProgress += 2;

        updateSplashProgress();

        if(splashProgress >= 100){

            clearInterval(splashInterval);

            splashProgress = 100;

            updateSplashProgress();

            setTimeout(() => {

                finishSplashLoading();

            }, 500);

        }

    }, 40);

}


//==================================================//
// UPDATE SPLASH PROGRESS
//==================================================//

function updateSplashProgress(){

    if(progressFill){

        progressFill.style.width =
            `${splashProgress}%`;

    }

    if(progressPercent){

        progressPercent.textContent =
            `${splashProgress}%`;

    }

}


//==================================================//
// FINISH SPLASH
//==================================================//

function finishSplashLoading(){

    appState.currentScreen = "login";

    showScreen("loginScreen");

}


//==================================================//
// RESTART SPLASH
//==================================================//

function restartSplash(){

    if(splashInterval){

        clearInterval(splashInterval);

    }

    splashProgress = 0;

    updateSplashProgress();

    appState.currentScreen = "splash";

    showScreen("splashScreen");

    startSplashLoading();

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.startSplashLoading =
    startSplashLoading;

window.restartSplash =
    restartSplash;

window.updateSplashProgress =
    updateSplashProgress;
    //==================================================//
// SCRIPT.JS - PART 3/12
// GOOGLE LOGIN
//==================================================//


//==================================================//
// GOOGLE LOGIN BUTTON
//==================================================//

if(googleLoginBtn){

    googleLoginBtn.addEventListener(
        "click",
        loginWithGoogle
    );

}


//==================================================//
// LOGIN WITH GOOGLE
//==================================================//

async function loginWithGoogle(){

    try{

        appState.isLoading = true;

        googleLoginBtn.disabled = true;

        googleLoginBtn.style.opacity = "0.6";

        showScreen("syncScreen");

        updateSyncStatus(
            "login",
            "loading",
            "Signing in..."
        );

        const result =
            await window.signInWithPopup(
                window.auth,
                window.provider
            );

        const user =
            result.user;

        appState.currentUser = user;

        appState.isGuest = false;

        updateUserUI(user);

        updateSyncStatus(
            "login",
            "success",
            "Login successful"
        );

        await prepareUserAccount(user);

    }

    catch(error){

        console.error(
            "Google login error:",
            error
        );

        appState.isLoading = false;

        if(googleLoginBtn){

            googleLoginBtn.disabled = false;

            googleLoginBtn.style.opacity = "1";

        }

        showScreen("loginScreen");

        alert(
            "Login gagal. Silakan coba lagi."
        );

    }

}


//==================================================//
// GUEST LOGIN
//==================================================//

if(guestLoginBtn){

    guestLoginBtn.addEventListener(
        "click",
        loginAsGuest
    );

}


//==================================================//
// LOGIN AS GUEST
//==================================================//

function loginAsGuest(){

    appState.currentUser = null;

    appState.isGuest = true;

    appState.isPremium = false;

    appState.userData = null;

    updateUserUI(null);

    showScreen("homeScreen");

    appState.currentScreen = "home";

}


//==================================================//
// GOOGLE LOGIN STATE
//==================================================//

function monitorAuthentication(){

    if(!window.auth){

        return;

    }

    window.onAuthStateChanged(
        window.auth,
        user => {

            if(user){

                appState.currentUser = user;

                appState.isGuest = false;

                updateUserUI(user);

            }

        }
    );

}


//==================================================//
// START AUTH MONITOR
//==================================================//

monitorAuthentication();


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.loginWithGoogle =
    loginWithGoogle;

window.loginAsGuest =
    loginAsGuest;

window.monitorAuthentication =
    monitorAuthentication;
    //==================================================//
// SCRIPT.JS - PART 4/12
// ACCOUNT & LOGOUT
//==================================================//


//==================================================//
// LOGOUT
//==================================================//

async function logoutUser(){

    try{

        appState.isLoading = true;

        if(window.auth){

            await window.signOut(
                window.auth
            );

        }

        appState.currentUser = null;

        appState.userData = null;

        appState.isPremium = false;

        appState.isGuest = false;

        appState.favorites = [];

        appState.currentScreen = "login";

        updateUserUI(null);

        showScreen("loginScreen");

    }

    catch(error){

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Gagal logout. Silakan coba lagi."
        );

    }

    finally{

        appState.isLoading = false;

    }

}


//==================================================//
// CHECK CURRENT USER
//==================================================//

function getCurrentUser(){

    return appState.currentUser;

}


//==================================================//
// CHECK LOGIN STATUS
//==================================================//

function isUserLoggedIn(){

    return (
        appState.currentUser !== null
    );

}


//==================================================//
// CHECK GUEST STATUS
//==================================================//

function isGuestUser(){

    return appState.isGuest === true;

}


//==================================================//
// UPDATE ACCOUNT STATE
//==================================================//

function setCurrentUser(user){

    appState.currentUser = user;

    appState.isGuest = !user;

    updateUserUI(user);

}


//==================================================//
// CLEAR ACCOUNT DATA
//==================================================//

function clearAccountData(){

    appState.currentUser = null;

    appState.userData = null;

    appState.isPremium = false;

    appState.isGuest = false;

    appState.favorites = [];

    appState.currentModel = null;

    appState.currentCategory = null;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.logoutUser =
    logoutUser;

window.getCurrentUser =
    getCurrentUser;

window.isUserLoggedIn =
    isUserLoggedIn;

window.isGuestUser =
    isGuestUser;

window.setCurrentUser =
    setCurrentUser;

window.clearAccountData =
    clearAccountData;
    //==================================================//
// SCRIPT.JS - PART 5/12
// FIRESTORE USER SYNCHRONIZATION
//==================================================//


//==================================================//
// PREPARE USER ACCOUNT
//==================================================//

async function prepareUserAccount(user){

    if(!user){

        return;

    }

    try{

        updateSyncStatus(
            "user",
            "loading",
            "Loading user data..."
        );

        const userRef =
            window.doc(
                window.db,
                "users",
                user.uid
            );

        const userSnapshot =
            await window.getDoc(userRef);


        //==================================================//
        // EXISTING USER
        //==================================================//

        if(userSnapshot.exists()){

            const data =
                userSnapshot.data();

            appState.userData = data;

            appState.isPremium =
                data.premium === true;

            appState.favorites =
                Array.isArray(data.favorites)
                    ? data.favorites
                    : [];

            updateSyncStatus(
                "user",
                "success",
                "User data loaded"
            );

        }


        //==================================================//
        // NEW USER
        //==================================================//

        else{

            const newUserData = {

                uid: user.uid,

                name:
                    user.displayName ||
                    "User",

                email:
                    user.email ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                premium: false,

                favorites: [],

                createdAt:
                    window.serverTimestamp()

            };

            await window.setDoc(
                userRef,
                newUserData
            );

            appState.userData =
                newUserData;

            appState.isPremium = false;

            appState.favorites = [];

            updateSyncStatus(
                "user",
                "success",
                "Account created"
            );

        }


        //==================================================//
        // UPDATE UI
        //==================================================//

        updateUserUI(user);


        //==================================================//
        // PREMIUM CHECK
        //==================================================//

        updateSyncStatus(
            "premium",
            "loading",
            "Checking Premium..."
        );

        await checkPremiumStatus();


        //==================================================//
        // FINISH SYNC
        //==================================================//

        updateSyncStatus(
            "finish",
            "loading",
            "Finalizing..."
        );

        await delay(500);

        updateSyncStatus(
            "finish",
            "success",
            "Ready!"
        );

        await delay(400);

        appState.isLoading = false;

        appState.currentScreen = "home";

        showScreen("homeScreen");

    }

    catch(error){

        console.error(
            "Account synchronization error:",
            error
        );

        appState.isLoading = false;

        alert(
            "Gagal menyiapkan akun. Silakan coba lagi."
        );

        showScreen("loginScreen");

    }

}


//==================================================//
// DELAY HELPER
//==================================================//

function delay(milliseconds){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


//==================================================//
// UPDATE SYNC STATUS
//==================================================//

function updateSyncStatus(
    type,
    status,
    text
){

    const icon =
        document.getElementById(
            `sync${capitalize(type)}Icon`
        );

    const textElement =
        document.getElementById(
            `sync${capitalize(type)}Text`
        );


    if(icon){

        icon.classList.remove(
            "waiting",
            "loading",
            "success"
        );

        icon.classList.add(
            status
        );

    }


    if(textElement){

        textElement.textContent =
            text;

    }

}


//==================================================//
// CAPITALIZE HELPER
//==================================================//

function capitalize(value){

    if(!value){

        return "";

    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.prepareUserAccount =
    prepareUserAccount;

window.updateSyncStatus =
    updateSyncStatus;

window.delay =
    delay;
    //==================================================//
// SCRIPT.JS - PART 6/12
// PREMIUM STATUS & FIRESTORE
//==================================================//


//==================================================//
// CHECK PREMIUM STATUS
//==================================================//

async function checkPremiumStatus(){

    if(!appState.currentUser){

        appState.isPremium = false;

        updateSyncStatus(
            "premium",
            "success",
            "Guest account"
        );

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        const userSnapshot =
            await window.getDoc(userRef);


        if(userSnapshot.exists()){

            const data =
                userSnapshot.data();

            appState.userData = data;

            appState.isPremium =
                data.premium === true;

            appState.favorites =
                Array.isArray(data.favorites)
                    ? data.favorites
                    : [];

        }

        else{

            appState.isPremium = false;

        }


        updateSyncStatus(
            "premium",
            "success",
            appState.isPremium
                ? "Premium active"
                : "Free account"
        );

        return appState.isPremium;

    }

    catch(error){

        console.error(
            "Premium check error:",
            error
        );

        appState.isPremium = false;

        updateSyncStatus(
            "premium",
            "success",
            "Free account"
        );

        return false;

    }

}


//==================================================//
// GET PREMIUM STATUS
//==================================================//

function getPremiumStatus(){

    return appState.isPremium === true;

}


//==================================================//
// UPDATE PREMIUM STATUS
//==================================================//

async function updatePremiumStatus(
    premium
){

    if(!appState.currentUser){

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        await window.setDoc(
            userRef,
            {
                premium: premium === true,
                updatedAt:
                    window.serverTimestamp()
            },
            {
                merge:true
            }
        );

        appState.isPremium =
            premium === true;

        if(!appState.userData){

            appState.userData = {};

        }

        appState.userData.premium =
            appState.isPremium;

        return true;

    }

    catch(error){

        console.error(
            "Premium update error:",
            error
        );

        return false;

    }

}


//==================================================//
// SAVE FAVORITES
//==================================================//

async function saveFavorites(){

    if(!appState.currentUser){

        return false;

    }

    try{

        const userRef =
            window.doc(
                window.db,
                "users",
                appState.currentUser.uid
            );

        await window.setDoc(
            userRef,
            {
                favorites:
                    appState.favorites,

                updatedAt:
                    window.serverTimestamp()

            },
            {
                merge:true
            }
        );

        return true;

    }

    catch(error){

        console.error(
            "Favorite save error:",
            error
        );

        return false;

    }

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.checkPremiumStatus =
    checkPremiumStatus;

window.getPremiumStatus =
    getPremiumStatus;

window.updatePremiumStatus =
    updatePremiumStatus;

window.saveFavorites =
    saveFavorites;
    //==================================================//
// SCRIPT.JS - PART 7/12
// SEARCH & CATEGORY
//==================================================//


//==================================================//
// SEARCH INPUT
//==================================================//

if(searchInput){

    searchInput.addEventListener(
        "input",
        handleSearch
    );

}


//==================================================//
// HANDLE SEARCH
//==================================================//

function handleSearch(event){

    const keyword =
        event.target.value
            .trim()
            .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".category-card"
        );

    cards.forEach(card => {

        const title =
            card.querySelector("h3");

        const description =
            card.querySelector("p");

        const titleText =
            title
                ? title.textContent.toLowerCase()
                : "";

        const descriptionText =
            description
                ? description.textContent.toLowerCase()
                : "";

        const category =
            card.dataset.category
                ? card.dataset.category.toLowerCase()
                : "";

        const matched =
            keyword === "" ||
            titleText.includes(keyword) ||
            descriptionText.includes(keyword) ||
            category.includes(keyword);

        card.style.display =
            matched
                ? ""
                : "none";

    });

}


//==================================================//
// CATEGORY BUTTONS
//==================================================//

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );


categoryCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const category =
                card.dataset.category;

            openCategory(category);

        }
    );

});


//==================================================//
// OPEN CATEGORY
//==================================================//

function openCategory(category){

    if(!category){

        return;

    }

    appState.currentCategory =
        category;

    console.log(
        "Category selected:",
        category
    );

    // Premium categories

    if(
        (
            category === "floating-island" ||
            category === "system"
        ) &&
        !appState.isPremium
    ){

        openPremiumPopup();

        return;

    }

    // Store selected category

    sessionStorage.setItem(
        "selectedCategory",
        category
    );

}


//==================================================//
// CLEAR SEARCH
//==================================================//

function clearSearch(){

    if(searchInput){

        searchInput.value = "";

        handleSearch({
            target: searchInput
        });

    }

}


//==================================================//
// GET SELECTED CATEGORY
//==================================================//

function getSelectedCategory(){

    return appState.currentCategory;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.handleSearch =
    handleSearch;

window.openCategory =
    openCategory;

window.clearSearch =
    clearSearch;

window.getSelectedCategory =
    getSelectedCategory;
    //==================================================//
// SCRIPT.JS - PART 8/12
// POPUP MANAGEMENT
//==================================================//


//==================================================//
// PREMIUM POPUP
//==================================================//

function openPremiumPopup(){

    if(!premiumPopup){

        return;

    }

    premiumPopup.classList.add("active");

}


//==================================================//
// CLOSE PREMIUM POPUP
//==================================================//

function closePremiumPopup(){

    if(!premiumPopup){

        return;

    }

    premiumPopup.classList.remove("active");

}


//==================================================//
// MODEL POPUP
//==================================================//

function openModelPopup(model){

    if(!modelPopup){

        return;

    }

    appState.currentModel =
        model || null;


    const preview =
        document.getElementById(
            "modelPreview"
        );

    const title =
        document.getElementById(
            "modelTitle"
        );

    const description =
        document.getElementById(
            "modelDescription"
        );


    if(preview){

        preview.src =
            model?.image ||
            "assets/default-model.jpg";

    }


    if(title){

        title.textContent =
            model?.name ||
            "Model";

    }


    if(description){

        description.textContent =
            model?.description ||
            "Model asset dari WV Entertainment.";

    }


    modelPopup.classList.add(
        "active"
    );

}


//==================================================//
// CLOSE MODEL POPUP
//==================================================//

function closeModelPopup(){

    if(!modelPopup){

        return;

    }

    modelPopup.classList.remove(
        "active"
    );

    appState.currentModel =
        null;

}


//==================================================//
// LOADING POPUP
//==================================================//

function showLoadingPopup(
    message = "Processing..."
){

    if(!loadingPopup){

        return;

    }

    const messageElement =
        document.getElementById(
            "loadingMessage"
        );

    if(messageElement){

        messageElement.textContent =
            message;

    }

    loadingPopup.classList.add(
        "active"
    );

}


//==================================================//
// HIDE LOADING POPUP
//==================================================//

function hideLoadingPopup(){

    if(!loadingPopup){

        return;

    }

    loadingPopup.classList.remove(
        "active"
    );

}


//==================================================//
// PREMIUM BUTTON
//==================================================//

if(
    document.getElementById(
        "premiumButton"
    )
){

    document.getElementById(
        "premiumButton"
    ).addEventListener(
        "click",
        openPremiumPopup
    );

}


//==================================================//
// CLOSE PREMIUM
//==================================================//

if(
    document.getElementById(
        "closePremiumPopup"
    )
){

    document.getElementById(
        "closePremiumPopup"
    ).addEventListener(
        "click",
        closePremiumPopup
    );

}


//==================================================//
// CLOSE MODEL
//==================================================//

if(
    document.getElementById(
        "closeModelPopup"
    )
){

    document.getElementById(
        "closeModelPopup"
    ).addEventListener(
        "click",
        closeModelPopup
    );

}


//==================================================//
// CLOSE POPUP WHEN CLICKING OUTSIDE
//==================================================//

document.querySelectorAll(
    ".popup-overlay"
).forEach(popup => {

    popup.addEventListener(
        "click",
        event => {

            if(
                event.target === popup
            ){

                popup.classList.remove(
                    "active"
                );

            }

        }
    );

});


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.openPremiumPopup =
    openPremiumPopup;

window.closePremiumPopup =
    closePremiumPopup;

window.openModelPopup =
    openModelPopup;

window.closeModelPopup =
    closeModelPopup;

window.showLoadingPopup =
    showLoadingPopup;

window.hideLoadingPopup =
    hideLoadingPopup;
    //==================================================//
// SCRIPT.JS - PART 9/12
// PREMIUM ACCESS
//==================================================//


//==================================================//
// BUY PREMIUM BUTTON
//==================================================//

const buyPremiumButton =
    document.getElementById(
        "buyPremiumButton"
    );


if(buyPremiumButton){

    buyPremiumButton.addEventListener(
        "click",
        handlePremiumPurchase
    );

}


//==================================================//
// HANDLE PREMIUM PURCHASE
//==================================================//

async function handlePremiumPurchase(){

    // Guest cannot activate Premium

    if(appState.isGuest){

        alert(
            "Silakan login terlebih dahulu untuk menggunakan Premium."
        );

        closePremiumPopup();

        showScreen("loginScreen");

        return;

    }


    if(!appState.currentUser){

        alert(
            "Silakan login terlebih dahulu."
        );

        closePremiumPopup();

        showScreen("loginScreen");

        return;

    }


    // Already Premium

    if(appState.isPremium){

        alert(
            "Akun kamu sudah memiliki Premium."
        );

        closePremiumPopup();

        return;

    }


    /*
     * Untuk sementara tombol ini belum
     * mengaktifkan Premium secara otomatis.
     *
     * Status Premium tetap disimpan
     * melalui Firestore.
     */

    showLoadingPopup(
        "Preparing Premium..."
    );

    await delay(800);

    hideLoadingPopup();

}


//==================================================//
// UNLOCK PREMIUM
//==================================================//

async function unlockPremium(){

    if(!appState.currentUser){

        return false;

    }


    showLoadingPopup(
        "Activating Premium..."
    );


    const success =
        await updatePremiumStatus(true);


    await delay(500);

    hideLoadingPopup();


    if(success){

        closePremiumPopup();

        alert(
            "Premium berhasil diaktifkan."
        );

        refreshPremiumUI();

        return true;

    }


    alert(
        "Gagal mengaktifkan Premium."
    );

    return false;

}


//==================================================//
// REFRESH PREMIUM UI
//==================================================//

function refreshPremiumUI(){

    const premiumBanner =
        document.querySelector(
            ".premium-banner"
        );

    const premiumButton =
        document.getElementById(
            "premiumButton"
        );


    if(appState.isPremium){

        if(premiumButton){

            premiumButton.textContent =
                "Premium";

        }


        if(premiumBanner){

            premiumBanner.style.opacity =
                "0.85";

        }


        document
            .querySelectorAll(
                ".category-card"
            )
            .forEach(card => {

                card.classList.add(
                    "premium-unlocked"
                );

            });

    }

}


//==================================================//
// CHECK PREMIUM BEFORE ACCESS
//==================================================//

function requirePremium(){

    if(appState.isPremium){

        return true;

    }


    openPremiumPopup();

    return false;

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.handlePremiumPurchase =
    handlePremiumPurchase;

window.unlockPremium =
    unlockPremium;

window.refreshPremiumUI =
    refreshPremiumUI;

window.requirePremium =
    requirePremium;
    //==================================================//
// SCRIPT.JS - PART 10/12
// FAVORITES
//==================================================//


//==================================================//
// CHECK FAVORITE
//==================================================//

function isFavorite(modelId){

    if(!modelId){

        return false;

    }

    return appState.favorites.includes(
        modelId
    );

}


//==================================================//
// ADD FAVORITE
//==================================================//

async function addFavorite(modelId){

    if(!modelId){

        return false;

    }

    if(appState.isGuest){

        alert(
            "Silakan login untuk menyimpan favorit."
        );

        return false;

    }

    if(!appState.currentUser){

        return false;

    }

    if(isFavorite(modelId)){

        return true;

    }

    appState.favorites.push(
        modelId
    );

    const saved =
        await saveFavorites();

    if(!saved){

        appState.favorites =
            appState.favorites.filter(
                id => id !== modelId
            );

        return false;

    }

    return true;

}


//==================================================//
// REMOVE FAVORITE
//==================================================//

async function removeFavorite(modelId){

    if(!modelId){

        return false;

    }

    const previousFavorites =
        [...appState.favorites];

    appState.favorites =
        appState.favorites.filter(
            id => id !== modelId
        );

    const saved =
        await saveFavorites();

    if(!saved){

        appState.favorites =
            previousFavorites;

        return false;

    }

    return true;

}


//==================================================//
// TOGGLE FAVORITE
//==================================================//

async function toggleFavorite(modelId){

    if(isFavorite(modelId)){

        return await removeFavorite(
            modelId
        );

    }

    return await addFavorite(
        modelId
    );

}


//==================================================//
// GET FAVORITES
//==================================================//

function getFavorites(){

    return [
        ...appState.favorites
    ];

}


//==================================================//
// UPDATE FAVORITE BUTTON
//==================================================//

function updateFavoriteButton(
    button,
    modelId
){

    if(!button || !modelId){

        return;

    }

    const favorite =
        isFavorite(modelId);

    button.textContent =
        favorite
            ? "❤️"
            : "♡";

    button.classList.toggle(
        "active",
        favorite
    );

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.isFavorite =
    isFavorite;

window.addFavorite =
    addFavorite;

window.removeFavorite =
    removeFavorite;

window.toggleFavorite =
    toggleFavorite;

window.getFavorites =
    getFavorites;

window.updateFavoriteButton =
    updateFavoriteButton;
    //==================================================//
// SCRIPT.JS - PART 11/12
// PROFILE & NAVIGATION
//==================================================//


//==================================================//
// NAVIGATION ELEMENTS
//==================================================//

const navHome =
    document.getElementById("navHome");

const navExplore =
    document.getElementById("navExplore");

const navFavorite =
    document.getElementById("navFavorite");

const navProfile =
    document.getElementById("navProfile");


//==================================================//
// SET ACTIVE NAVIGATION
//==================================================//

function setActiveNavigation(
    activeButton
){

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });

    if(activeButton){

        activeButton.classList.add(
            "active"
        );

    }

}


//==================================================//
// HOME NAVIGATION
//==================================================//

if(navHome){

    navHome.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navHome
            );

            appState.currentScreen =
                "home";

            showScreen(
                "homeScreen"
            );

        }
    );

}


//==================================================//
// EXPLORE NAVIGATION
//==================================================//

if(navExplore){

    navExplore.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navExplore
            );

            appState.currentScreen =
                "explore";

            if(searchInput){

                searchInput.focus();

            }

        }
    );

}


//==================================================//
// FAVORITE NAVIGATION
//==================================================//

if(navFavorite){

    navFavorite.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navFavorite
            );

            appState.currentScreen =
                "favorite";

            displayFavoriteState();

        }
    );

}


//==================================================//
// PROFILE NAVIGATION
//==================================================//

if(navProfile){

    navProfile.addEventListener(
        "click",
        () => {

            setActiveNavigation(
                navProfile
            );

            appState.currentScreen =
                "profile";

            displayProfileState();

        }
    );

}


//==================================================//
// DISPLAY PROFILE STATE
//==================================================//

function displayProfileState(){

    const user =
        appState.currentUser;

    if(user){

        updateUserUI(user);

    }

    else{

        updateUserUI(null);

    }

}


//==================================================//
// DISPLAY FAVORITE STATE
//==================================================//

function displayFavoriteState(){

    const favorites =
        getFavorites();

    console.log(
        "Favorite models:",
        favorites
    );

}


//==================================================//
// USER ACCOUNT INFO
//==================================================//

function getUserProfile(){

    if(!appState.currentUser){

        return {

            name:"Guest",

            email:"",

            photoURL:
                DEFAULT_PROFILE_IMAGE,

            premium:false

        };

    }

    return {

        name:
            appState.currentUser.displayName ||
            "User",

        email:
            appState.currentUser.email ||
            "",

        photoURL:
            appState.currentUser.photoURL ||
            DEFAULT_PROFILE_IMAGE,

        premium:
            appState.isPremium

    };

}


//==================================================//
// GLOBAL EXPORT
//==================================================//

window.setActiveNavigation =
    setActiveNavigation;

window.displayProfileState =
    displayProfileState;

window.displayFavoriteState =
    displayFavoriteState;

window.getUserProfile =
    getUserProfile;
    //==================================================//
// SCRIPT.JS - PART 12/12
// UTILITIES & FINAL INITIALIZATION
//==================================================//


//==================================================//
// UPDATE SYNC PROGRESS
//==================================================//

function updateSyncProgress(percent){

    const fill =
        document.getElementById(
            "syncProgressFill"
        );

    const text =
        document.getElementById(
            "syncProgressText"
        );

    const value =
        Math.max(
            0,
            Math.min(100, percent)
        );

    if(fill){

        fill.style.width =
            `${value}%`;

    }

    if(text){

        text.textContent =
            `${value}%`;

    }

}


//==================================================//
// SHOW HOME
//==================================================//

function showHome(){

    appState.currentScreen =
        "home";

    showScreen(
        "homeScreen"
    );

    if(navHome){

        setActiveNavigation(
            navHome
        );

    }

}


//==================================================//
// ESCAPE HTML
//==================================================//

function escapeHTML(value){

    if(value === null ||
       value === undefined){

        return "";

    }

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;

}


//==================================================//
// SAFE LOCAL STORAGE
//==================================================//

function saveLocalData(
    key,
    value
){

    try{

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    }

    catch(error){

        console.error(
            "Local storage error:",
            error
        );

        return false;

    }

}


function getLocalData(key){

    try{

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : null;

    }

    catch(error){

        console.error(
            "Local data error:",
            error
        );

        return null;

    }

}


//==================================================//
// CLOSE ALL POPUPS
//==================================================//

function closeAllPopups(){

    document
        .querySelectorAll(
            ".popup-overlay"
        )
        .forEach(popup => {

            popup.classList.remove(
                "active"
            );

        });

}


//==================================================//
// ESC KEY
//==================================================//

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            closeAllPopups();

        }

    }
);


//==================================================//
// INITIAL FIREBASE AUTH STATE
//==================================================//

if(window.auth){

    window.onAuthStateChanged(
        window.auth,
        user => {

            if(user){

                appState.currentUser =
                    user;

                appState.isGuest =
                    false;

                updateUserUI(user);

            }

        }
    );

}


//==================================================//
// FINAL EXPORTS
//==================================================//

window.updateSyncProgress =
    updateSyncProgress;

window.showHome =
    showHome;

window.escapeHTML =
    escapeHTML;

window.saveLocalData =
    saveLocalData;

window.getLocalData =
    getLocalData;

window.closeAllPopups =
    closeAllPopups;


//==================================================//
// SCRIPT.JS COMPLETE
//==================================================//