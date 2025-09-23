import { collection, getDocs, doc, getDoc, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, ProjectDocument, UserProfile } from './types';
import { auth } from './firebase';

function docToProject(doc: ProjectDocument, id: string): Project {
    return {
        id,
        ...doc,
        startDate: doc.startDate.toDate(),
        endDate: doc.endDate ? doc.endDate.toDate() : null,
    };
}


export async function getProjects(): Promise<Project[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, where('userId', '==', user.uid), orderBy('startDate', 'desc'));
    const projectSnapshot = await getDocs(q);
    const projectList = projectSnapshot.docs.map(doc => {
        const data = doc.data() as ProjectDocument;
        return docToProject(data, doc.id);
    });
    return projectList;
}

export async function getProject(id: string): Promise<Project | null> {
    const projectDocRef = doc(db, 'projects', id);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
        const data = projectDoc.data() as ProjectDocument;
        
        // Security check: ensure the current user owns this project
        const user = auth.currentUser;
        if(data.userId !== user?.uid) {
            return null;
        }

        return docToProject(data, projectDoc.id);
    }
    return null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
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
        }
    }
    return null;
}
