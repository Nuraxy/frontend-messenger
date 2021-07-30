import {Injectable} from '@angular/core';
import {openDB, IDBPDatabase} from 'idb';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private db!: IDBPDatabase;

  constructor() {
  }

  async connectToDb(): Promise<void> {
    this.db = await openDB('messenger-db', 1, {
      upgrade(db): void {
        db.createObjectStore('key-pair-store');
      }
    });
  }

  addKeyToDb(key: CryptoKey, name: string): Observable<CryptoKey> {
    const transaction = this.db.transaction('key-pair-store', 'readwrite');
    const promise = Promise.all([
      transaction.objectStore('key-pair-store').put(key, name),
      transaction.done
    ]);
    return from(promise).pipe(
      map(() => key)
    );
  }

  deleteInDb(key: string): Observable<void> {
    return from(this.db.delete('key-pair-store', key));
  }

  getFromDb(storeName: string, objectName: string): Observable<CryptoKey>{
    const transaction = this.db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    return from(objectStore.get(objectName));
  }


  // async normalConnectToDb(): Promise<void> {
  //   this.db = await openDB('my-user-test-db', 3, {
  //     upgrade(db, oldVersion, newVersion, transaction): void {
  //       oldVersion = oldVersion ?? 0;
  //       if (oldVersion < 1) {
  //         db.createObjectStore('user-store', {keyPath: 'userId'});
  //       }
  //       if (oldVersion < 2) {
  //         transaction.objectStore('user-store').createIndex('emailIdx', 'email', {unique: true});
  //       }
  //       if (oldVersion < 3) {
  //         transaction.objectStore('user-store').createIndex('nameEmailIdx', ['name', 'email'], {unique: true});
  //       }
  //     },
  //   });
  // }

  // normalAddUser(name: string): Observable<string> | null {
  //   // return from(this.db.put('user-store', name));
  //   return null;
  // }

  // normalDeleteUser(key: string): Observable<void> {
  //   return from(this.db.delete('user-store', key));
  // }

  // testAdd(user: User): Observable<User> {
  //   const transaction = this.db.transaction('user-store', 'readwrite');
  //   const promise = Promise.all([
  //     transaction.objectStore('user-store').put(user),
  //     transaction.done
  //   ]);
  //
  //   return from(promise).pipe(
  //     map(() => user)
  //   );
  // }
}
