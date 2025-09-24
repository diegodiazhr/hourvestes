
import { collection, getDocs, doc, getDoc, orderBy, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, ProjectDocument, UserProfile } from './types';

function docToProject(doc: ProjectDocument, id: string): Project {
    return {
        id,
        ...doc,
        startDate: doc.startDate.toDate(),
        endDate: doc.endDate ? doc.endDate.toDate() : null,
    };
}


export async function getProjects(userId: string): Promise<Project[]> {
    if (!db) {
        console.error("Firestore is not initialized. Make sure you are calling this function on the client side.");
        return [];
    }
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, where('userId', '==', userId), orderBy('startDate', 'desc'));
    const projectSnapshot = await getDocs(q);
    const projectList = projectSnapshot.docs.map(doc => {
        const data = doc.data() as ProjectDocument;
        return docToProject(data, doc.id);
    });
    return projectList;
}

export async function getProject(id: string): Promise<Project | null> {
    if (!db) return null;
    const projectDocRef = doc(db, 'projects', id);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
        const data = projectDoc.data() as ProjectDocument;
        return docToProject(data, projectDoc.id);
    }
    return null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!db) return null;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if(userDoc.exists()) {
        const data = userDoc.data();
        return {
            id: userDoc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            school: data.school,
            teacherId: data.teacherId,
        }
    }
    return null;
}

export function onStudentsUpdate(teacherId: string, callback: (students: UserProfile[]) => void) {
    if (!db) {
        console.error("Firestore is not initialized for onStudentsUpdate.");
        return () => {}; // Return an empty unsubscribe function
    }
    const usersCol = collection(db, 'users');
    const q = query(
      usersCol,
      where('role', '==', 'Alumno'),
      where('teacherId', '==', teacherId)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          school: data.school,
          teacherId: data.teacherId,
        };
      });
      callback(studentList);
    });
  
    return unsubscribe;
}

export async function getProjectsForStudent(studentId: string): Promise<Project[]> {
    if (!db) {
        console.error("Firestore is not initialized. Make sure you are calling this function on the client side.");
        return [];
    }
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, where('userId', '==', studentId), orderBy('startDate', 'desc'));
    const projectSnapshot = await getDocs(q);
    const projectList = projectSnapshot.docs.map(doc => {
        const data = doc.data() as ProjectDocument;
        return docToProject(data, doc.id);
    });
    return projectList;
}
