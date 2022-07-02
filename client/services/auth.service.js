import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  updateDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  browserSessionPersistence,
  setPersistence,
  inMemoryPersistence,
  onAuthStateChanged,
} from "firebase/auth";

import { getStorage, ref, uploadBytes } from "firebase/storage";

const db = getFirestore();
const auth = getAuth();

export const register = async (regdata) => {
  try {
    let { email, password, name } = regdata;
    console.log(regdata);
    let user = await createUserWithEmailAndPassword(auth, email, password);
    console.log(user.user.uid);
    let userData = await setDoc(doc(db, "users", user.user.uid), {
      name: name,
      email: email,
    });
    // add cid or uid afterwards
    console.log(user);
    console.log(userData);
    // let persistence = await setPersistence(auth, browserSessionPersistence);
    return { message: "Registered", user: user };
  } catch (err) {
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    let user = await signInWithEmailAndPassword(auth, email, password);
    console.log(user);
    let userdata = await getDoc(doc(db, "users", user.user.uid));
    if (userdata.exists()) {
      console.log("Document data:", userdata.data());
      return { message: "signed-in", user: user, userdata: userdata.data() };
    } else {
      return { message: "no data found" };
    }
  } catch (err) {
    throw err;
  }
};

export const logout = async () => {
  try {
    let user = await signOut(auth);
    console.log("logged-out", user);
    return { message: "logged-out", user: user || null };
  } catch (err) {
    throw err;
  }
};

export const getAllSeller = async () => {
  try {
    let allSellers = await getDocs(collection(db, "sellers"));
    let sellerDetails = [];
    allSellers.forEach((doc) => {
      sellerDetails.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    return { message: "Sellers found", sellerData: sellerDetails };
  } catch (err) {
    throw err;
  }
};

export const getSpecSeller = async (sellerData) => {
  try {
    let sellerData = await getDoc(doc(db, "sellers", sellerData.sid));
    return { message: "Sellers found", sellerData: sellerData.data() };
  } catch (err) {
    throw err;
  }
};

export const addSeller = async (sellerdata) => {
  try {
    let {
      stationName,
      portType,
      address,
      numberofports,
      amenities,
      longitude,
      latitude,
      type,
    } = sellerdata;
    let uid = await AsyncStorage.getItem("@userId");
    let sellerData = await setDoc(doc(db, "sellers"), {
      stationName: stationName,
      portType: portType,
      address: address,
      numberofports: numberofports,
      amenities: amenities,
      longitude: longitude,
      latitude: latitude,
      uid: uid,
      type: type,
    });
    let upUser = await updateDoc(doc(db, "users", uid), {
      isSeller: true,
    });
    return { message: "data set" };
  } catch (err) {
    throw err;
  }
};

export const sellerAddProfileImage = async (file) => {
  try {
    let uid = await AsyncStorage.getItem("@userId");
    const storage = getStorage();
    let user = await getDoc(doc(db, "users", uid));
    const storageRef = ref(
      storage,
      `sellers/${uid}/${user.stationName}/profileImage`
    );
    let upImage = await uploadBytes(storageRef, file);

    return { message: "File Uploaded" };
  } catch (err) {
    throw err;
  }
};
