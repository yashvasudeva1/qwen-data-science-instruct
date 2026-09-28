/**
 * Firebase configuration and initialization.
 * Reads credentials from Vite env variables (VITE_FIREBASE_*).
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate app initialization in dev hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ────────────────────────────────────────────────────────────

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email: string, password: string, displayName?: string) =>
  createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  });

export const logOut = () => signOut(auth);

export { onAuthStateChanged };
export type { User };

// ─── Firestore helpers ───────────────────────────────────────────────────────

export interface FirestoreConversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  isStarred: boolean;
  createdAt: number;
  updatedAt: number;
  projectId?: string;
}

export interface FirestoreMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  thinkingDuration?: number;
  modelUsed?: string;
  artifacts?: string; // JSON stringified
  attachments?: string; // JSON stringified
}

/** Create or update a conversation document */
export const upsertConversation = async (conv: FirestoreConversation) => {
  const ref = doc(db, 'conversations', conv.id);
  await setDoc(ref, { ...conv, updatedAt: Date.now() }, { merge: true });
};

/** Fetch all conversations for a user, ordered by last update */
export const fetchConversations = async (userId: string): Promise<FirestoreConversation[]> => {
  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreConversation);
};

/** Delete a conversation and all its messages */
export const deleteConversation = async (conversationId: string) => {
  // Delete the conversation doc
  await deleteDoc(doc(db, 'conversations', conversationId));
  // Delete all messages in the sub-collection
  const msgsSnap = await getDocs(
    collection(db, 'conversations', conversationId, 'messages')
  );
  const deletes = msgsSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
};

/** Save a single message to the sub-collection of a conversation */
export const saveMessage = async (msg: FirestoreMessage) => {
  const ref = doc(db, 'conversations', msg.conversationId, 'messages', msg.id);
  await setDoc(ref, msg);
};

/** Fetch all messages for a conversation */
export const fetchMessages = async (conversationId: string): Promise<FirestoreMessage[]> => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreMessage);
};

/** Update star status of a conversation */
export const updateConversationStar = async (conversationId: string, isStarred: boolean) => {
  await updateDoc(doc(db, 'conversations', conversationId), { isStarred, updatedAt: Date.now() });
};

/** Rename a conversation */
export const renameConversation = async (conversationId: string, title: string) => {
  await updateDoc(doc(db, 'conversations', conversationId), { title, updatedAt: Date.now() });
};
