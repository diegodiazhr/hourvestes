
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, ProjectDocument } from './types';

function docToProject(doc: ProjectDocument, id: string): Project {
    return {
        id,
        ...doc,
        startDate: doc.startDate.toDate(),
        endDate: doc.endDate ? doc.endDate.toDate() : null,
    };
}


export async function getProjects(): Promise<Project[]> {
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, orderBy('startDate', 'desc'));
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
        return docToProject(data, projectDoc.id);
    }
    return null;
}
