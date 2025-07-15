const { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, limit } = require('firebase/firestore');
const { db } = require('./firebase');

class FirestoreService {
  constructor(collectionName) {
    this.collectionRef = collection(db, collectionName);
  }

  /**
   * Create a document with optional ID or auto-generated ID
   * @param {string|null} docId 
   * @param {Object} data 
   * @returns {Promise<string>} Document ID
   */
  async create(docId, data) {
    try {
      if (docId) {
        const docRef = doc(this.collectionRef, docId);
        await setDoc(docRef, data, { merge: true });
        return docId;
      } else {
        const docRef = await addDoc(this.collectionRef, data);
        return docRef.id;
      }
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  /**
   * Read document by ID
   * @param {string} docId 
   * @returns {Promise<Object|null>} Document data or null if not found
   */
  async read(docId) {
    try {
      const docRef = doc(this.collectionRef, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      throw new Error(`Failed to read document: ${error.message}`);
    }
  }

  /**
   * Read all documents in the collection
   * @returns {Promise<Array>} Array of documents with id and data
   */
  async readAll() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to read all documents: ${error.message}`);
    }
  }

  /**
   * Update document by ID
   * @param {string} docId 
   * @param {Object} data 
   */
  async update(docId, data) {
    try {
      const docRef = doc(this.collectionRef, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  /**
   * Delete document by ID
   * @param {string} docId 
   */
  async delete(docId) {
    try {
      const docRef = doc(this.collectionRef, docId);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Find first document matching field=value
   * @param {string} field 
   * @param {*} value 
   * @returns {Promise<Object|null>}
   */
  async findByField(field, value) {
    try {
      const q = query(this.collectionRef, where(field, '==', value), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find document by field: ${error.message}`);
    }
  }
}

module.exports = FirestoreService;
